/**
 * 自动发现新 AI 工具并追加到 tools.json
 * 运行: node scripts/update-tools.mjs
 * 需要环境变量: ANTHROPIC_API_KEY
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "../data/tools.json");

const CATEGORIES = [
  "对话AI", "AI搜索", "图像生成", "视频生成", "编程辅助",
  "写作辅助", "演示文稿", "效率工具", "设计工具", "音频与语音", "翻译工具", "开发者工具"
];

function normalizeName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeId(id) {
  return String(id ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function normalizeUrl(raw) {
  try {
    const u = new URL(String(raw ?? "").trim());
    // Normalize: drop hash, drop trailing slash, lower-case host, strip common tracking params.
    u.hash = "";
    u.hostname = u.hostname.toLowerCase();
    const params = u.searchParams;
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "ref_src",
      "source",
    ].forEach((k) => params.delete(k));
    u.search = params.toString() ? `?${params.toString()}` : "";
    u.pathname = u.pathname.replace(/\/+$/, "");
    return u.toString();
  } catch {
    return null;
  }
}

function isAllowedCategory(category) {
  return CATEGORIES.includes(category);
}

function normalizeCategories(tool) {
  const raw = Array.isArray(tool?.categories)
    ? tool.categories
    : tool?.category
      ? [tool.category]
      : [];

  const cats = raw
    .map((c) => String(c ?? "").trim())
    .filter(Boolean);

  // De-dupe & keep order
  const out = [];
  const seen = new Set();
  for (const c of cats) {
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out;
}

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text;
}

function extractJSON(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\])/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[1]);
}

async function discoverNewTools(existingIds, existingNames) {
  const today = new Date().toISOString().split("T")[0];

  const prompt = `你是一个AI工具研究专家。请推荐 15 个优质的AI工具，要求：
1. 不能重复以下已有工具：${existingNames.slice(0, 30).join("、")}
2. 必须是真实存在的工具，提供准确的官方网址
3. 优先选择近期热门或实用的工具
4. 覆盖多个类别

请严格按以下 JSON 格式返回，不要有任何额外文字：

\`\`\`json
[
  {
    "id": "工具英文id（小写+连字符，全局唯一）",
    "name": "工具名称",
    "category": "分类（从以下选一个：${CATEGORIES.join("/")}）",
    "url": "官方网址",
    "free": true或false（是否有免费版本）,
    "description": "30-60字中文描述，说明核心功能和特点",
    "tags": ["标签1", "标签2", "标签3"],
    "addedAt": "${today}"
  }
]
\`\`\``;

  const text = await callClaude(prompt);
  return extractJSON(text);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("错误：请设置 ANTHROPIC_API_KEY 环境变量");
    process.exit(1);
  }

  console.log("读取现有工具库...");
  const data = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const existingIds = new Set(data.tools.map((t) => normalizeId(t.id)));
  const existingNames = data.tools.map((t) => t.name);
  const existingNameKeys = new Set(data.tools.map((t) => normalizeName(t.name)));
  const existingUrlKeys = new Set(
    data.tools
      .map((t) => normalizeUrl(t.url))
      .filter(Boolean)
  );

  console.log(`当前工具数量：${data.tools.length}`);
  console.log("正在让 Claude 发现新工具...");

  let newTools = [];
  try {
    const candidates = await discoverNewTools(existingIds, existingNames);

    const seenCandidateIds = new Set();
    const seenCandidateNames = new Set();
    const seenCandidateUrls = new Set();

    for (const tool of candidates) {
      const id = normalizeId(tool?.id);
      const nameKey = normalizeName(tool?.name);
      const urlKey = normalizeUrl(tool?.url);
      const categories = normalizeCategories(tool);

      if (!id || !tool?.name || !tool?.url || categories.length === 0) continue;
      if (!categories.every((c) => isAllowedCategory(c))) continue;
      if (!urlKey) continue;

      // Deduplicate against existing dataset
      if (existingIds.has(id)) continue;
      if (existingNameKeys.has(nameKey)) continue;
      if (existingUrlKeys.has(urlKey)) continue;

      // Deduplicate within this candidate batch
      if (seenCandidateIds.has(id)) continue;
      if (seenCandidateNames.has(nameKey)) continue;
      if (seenCandidateUrls.has(urlKey)) continue;

      // Ensure ID is globally unique (suffix if needed)
      let finalId = id;
      let suffix = 1;
      while (existingIds.has(finalId) || seenCandidateIds.has(finalId)) {
        finalId = `${id}-${suffix++}`;
      }

      newTools.push({
        ...tool,
        id: finalId,
        url: urlKey,
        categories,
        category: categories[0],
      });

      existingIds.add(finalId);
      existingNameKeys.add(nameKey);
      existingUrlKeys.add(urlKey);
      seenCandidateIds.add(finalId);
      seenCandidateNames.add(nameKey);
      seenCandidateUrls.add(urlKey);
    }
  } catch (err) {
    console.error("发现新工具时出错：", err.message);
    process.exit(1);
  }

  if (newTools.length === 0) {
    console.log("没有发现新工具，跳过更新");
    process.exit(0);
  }

  data.tools.push(...newTools);
  const nowIso = new Date().toISOString();
  data.lastUpdated = nowIso.split("T")[0];
  data.lastUpdatedAt = nowIso;

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");

  console.log(`成功添加 ${newTools.length} 个新工具：`);
  newTools.forEach((t) => console.log(`  + ${t.name} (${t.category})`));
  console.log(`工具库总数：${data.tools.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

"use client";

import { useEffect, useMemo, useState } from "react";
import toolsData from "@/data/tools.json";
import ToolCard from "@/components/ToolCard";
import CategoryFilter from "@/components/CategoryFilter";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import toolsEn from "@/data/tools.en.json";

const CATEGORY_ORDER = [
  "全部",
  "对话AI",
  "AI搜索",
  "图像生成",
  "视频生成",
  "编程辅助",
  "写作辅助",
  "演示文稿",
  "效率工具",
  "设计工具",
  "音频与语音",
  "翻译工具",
  "开发者工具",
];

export default function Home() {
  const { locale, t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const sponsorUrl = "https://www.patreon.com/posts/support-ai-daily-155166835";

  const tools = toolsData.tools;

  const lastUpdatedAt = (toolsData as any).lastUpdatedAt as string | undefined;
  const lastUpdatedAtText = useMemo(() => {
    if (!lastUpdatedAt) return null;
    const d = new Date(lastUpdatedAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(locale === "zh" ? "zh-CN" : "en", { hour12: false });
  }, [lastUpdatedAt, locale]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data === "object" && data.usage && typeof data.usage === "object") {
          setUsage(data.usage);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const t of tools as any[]) {
      if (Array.isArray(t.categories) && t.categories.length) {
        t.categories.forEach((c: unknown) => cats.add(String(c)));
      } else if (t.category) {
        cats.add(String(t.category));
      }
    }
    return CATEGORY_ORDER.filter((c) => c === "全部" || cats.has(c));
  }, [tools]);

  const filtered = useMemo(() => {
    const list = tools.filter((tool) => {
      const toolCats = Array.isArray((tool as any).categories)
        ? (tool as any).categories
        : tool.category
          ? [tool.category]
          : [];
      const matchCategory =
        selectedCategory === "全部" || toolCats.includes(selectedCategory);
      const matchFree = !freeOnly || tool.free;
      const q = searchQuery.toLowerCase();
      const enDesc =
        locale === "en"
          ? (((toolsEn as any).descriptions?.[tool.id] as string | undefined) ?? "").toLowerCase()
          : "";
      const enTags =
        locale === "en"
          ? (tool.tags || [])
              .map(
                (tag) =>
                  ((toolsEn as any).tagTranslations?.[tag] as string | undefined) ?? tag
              )
              .join(" ")
              .toLowerCase()
          : "";
      const matchSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        enDesc.includes(q) ||
        enTags.includes(q) ||
        tool.tags.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchFree && matchSearch;
    });

    // Sort by usage desc (clicks), then by name for stability.
    return list.sort((a, b) => {
      const ua = usage[a.id] ?? 0;
      const ub = usage[b.id] ?? 0;
      if (ua !== ub) return ub - ua;
      return a.name.localeCompare(b.name, locale === "zh" ? "zh-Hans-CN" : "en");
    });
  }, [tools, selectedCategory, freeOnly, searchQuery, usage, locale]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex flex-col items-center text-center gap-1 sm:items-start sm:text-left sm:block sm:flex-shrink-0">
            <div className="flex flex-col items-center sm:items-start">
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-blue-600">AI</span>{" "}
                {t("app.title").replace(/^AI\s*/, "")}
              </h1>
              <p className="text-xs text-gray-400">
                {t("header.lastUpdated", {
                  date: toolsData.lastUpdated,
                  time: lastUpdatedAtText ? ` (${lastUpdatedAtText})` : "",
                })}
              </p>
            </div>
          </div>

          <div className="w-full sm:flex-1 sm:max-w-xl">
            <input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:justify-end sm:gap-4">
            <div>
              <LanguageToggle />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="rounded text-blue-600"
              />
              {t("header.freeOnly")}
            </label>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t("app.subtitle")}
          </h2>
          <p className="text-gray-500 text-sm">
            {t("hero.totalTools", { count: tools.length })}
          </p>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Results count */}
        <div className="text-sm text-gray-400 mb-4">
          {t("results.count", { count: filtered.length })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>{t("results.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <div>{t("app.footer")}</div>
          <a
            href={sponsorUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            aria-label={t("footer.sponsorHint")}
            title={t("footer.sponsorHint")}
          >
            <span className="text-pink-600">♥</span>
            <span>{t("footer.sponsor")}</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

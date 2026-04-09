"use client";

import { useState, useMemo } from "react";
import toolsData from "@/data/tools.json";
import ToolCard from "@/components/ToolCard";
import CategoryFilter from "@/components/CategoryFilter";

const CATEGORY_ORDER = [
  "全部",
  "对话AI",
  "AI搜索",
  "图像生成",
  "视频生成",
  "编程辅助",
  "写作辅助",
  "效率工具",
  "设计工具",
  "音频与语音",
  "翻译工具",
  "开发者工具",
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);

  const tools = toolsData.tools;

  const categories = useMemo(() => {
    const cats = new Set(tools.map((t) => t.category));
    return CATEGORY_ORDER.filter((c) => c === "全部" || cats.has(c));
  }, [tools]);

  const filtered = useMemo(() => {
    return tools.filter((tool) => {
      const matchCategory = selectedCategory === "全部" || tool.category === selectedCategory;
      const matchFree = !freeOnly || tool.free;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchFree && matchSearch;
    });
  }, [tools, selectedCategory, freeOnly, searchQuery]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-blue-600">AI</span> 工具库
            </h1>
            <p className="text-xs text-gray-400">最后更新：{toolsData.lastUpdated}</p>
          </div>
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="搜索工具名称、功能..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="rounded text-blue-600"
            />
            只看免费
          </label>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            发现最好的 AI 工具
          </h2>
          <p className="text-gray-500 text-sm">
            共收录 <span className="font-semibold text-blue-600">{tools.length}</span> 个工具，持续更新中
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
          找到 <span className="font-medium text-gray-700">{filtered.length}</span> 个工具
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>没有找到匹配的工具</p>
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
        AI工具库 · 每周自动更新 · 数据由 AI 整理
      </footer>
    </div>
  );
}

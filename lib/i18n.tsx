"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "zh" | "en";

type Messages = Record<string, string>;

const MESSAGES: Record<Locale, Messages> = {
  zh: {
    "app.title": "AI 狗腿子库",
    "app.subtitle": "瞎乎用吧，ai狗腿子们",
    "app.footer": "AI狗腿子库 · 每日自动更新 · 数据由 AI 整理",

    "header.lastUpdated": "最后更新：{date}{time}",
    "header.searchPlaceholder": "搜搜狗腿子名字、技能...",
    "header.freeOnly": "只看免费",
    "header.language": "语言",

    "hero.totalTools": "共收录 {count} 个ai狗腿子",
    "results.count": "找到 {count} 个狗腿子",
    "results.empty": "没找到匹配的狗腿子",

    "tool.free": "可白嫖",
    "tool.paid": "付费",
  },
  en: {
    "app.title": "AI Sidekicks",
    "app.subtitle": "Use it or lose it — your AI minions await",
    "app.footer": "AI Sidekicks · Auto-updated daily · Curated by AI",

    "header.lastUpdated": "Last updated: {date}{time}",
    "header.searchPlaceholder": "Search your sidekicks by name, skills...",
    "header.freeOnly": "Free only",
    "header.language": "Language",

    "hero.totalTools": "{count} AI sidekicks recruited",
    "results.count": "{count} sidekicks found",
    "results.empty": "No sidekicks matched",

    "tool.free": "Free",
    "tool.paid": "Paid",
  },
};

// Data source uses Chinese category strings. We keep those as stable IDs for filtering,
// and translate only for display.
const CATEGORY_LABELS: Record<Locale, Record<string, string>> = {
  zh: {
    "全部": "全部",
    "对话AI": "对话AI",
    "AI搜索": "AI搜索",
    "图像生成": "图像生成",
    "视频生成": "视频生成",
    "编程辅助": "编程辅助",
    "写作辅助": "写作辅助",
    "演示文稿": "演示文稿",
    "效率工具": "效率工具",
    "设计工具": "设计工具",
    "音频与语音": "音频与语音",
    "翻译工具": "翻译工具",
    "开发者工具": "开发者工具",
  },
  en: {
    "全部": "All",
    "对话AI": "Chat AI",
    "AI搜索": "AI Search",
    "图像生成": "Image Generation",
    "视频生成": "Video Generation",
    "编程辅助": "Coding",
    "写作辅助": "Writing",
    "演示文稿": "Presentations",
    "效率工具": "Productivity",
    "设计工具": "Design",
    "音频与语音": "Audio & Speech",
    "翻译工具": "Translation",
    "开发者工具": "Developer Tools",
  },
};

function format(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export function getCategoryLabel(locale: Locale, categoryZh: string) {
  return CATEGORY_LABELS[locale][categoryZh] ?? categoryZh;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_STORAGE_KEY = "ai_tools_locale";

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "zh" || stored === "en") return stored;
  const nav = (navigator.language || "").toLowerCase();
  return nav.startsWith("zh") ? "zh" : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitialLocale());

  const setLocale = (l: Locale) => setLocaleState(l);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {}
    try {
      document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    } catch {}
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const messages = MESSAGES[locale];
    return {
      locale,
      setLocale,
      t: (key, vars) => format(messages[key] ?? key, vars),
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

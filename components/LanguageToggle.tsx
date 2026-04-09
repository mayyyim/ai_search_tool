"use client";

import { useI18n } from "@/lib/i18n";

export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="text-xs text-gray-400 hidden sm:inline">{t("header.language")}</span>
      <div className="inline-flex rounded-full border border-gray-200 bg-white p-0.5">
        <button
          type="button"
          onClick={() => setLocale("zh")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            locale === "zh" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"
          }`}
          aria-pressed={locale === "zh"}
        >
          中文
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            locale === "en" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"
          }`}
          aria-pressed={locale === "en"}
        >
          EN
        </button>
      </div>
    </div>
  );
}

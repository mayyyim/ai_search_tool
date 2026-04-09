import { getCategoryLabel, useI18n } from "@/lib/i18n";

const CATEGORY_ICONS: Record<string, string> = {
  "全部": "✦",
  "对话AI": "💬",
  "AI搜索": "🔍",
  "图像生成": "🎨",
  "视频生成": "🎬",
  "编程辅助": "💻",
  "写作辅助": "✍️",
  "演示文稿": "📊",
  "效率工具": "⚡",
  "设计工具": "🖌️",
  "音频与语音": "🎵",
  "翻译工具": "🌐",
  "开发者工具": "🛠️",
};

interface Props {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: Props) {
  const { locale } = useI18n();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
            selected === cat
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          <span>{CATEGORY_ICONS[cat] || "•"}</span>
          {getCategoryLabel(locale, cat)}
        </button>
      ))}
    </div>
  );
}

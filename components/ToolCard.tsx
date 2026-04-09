interface Tool {
  id: string;
  name: string;
  category: string;
  url: string;
  free: boolean;
  description: string;
  tags: string[];
  addedAt: string;
}

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        try {
          // best-effort; do not block navigation
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: tool.id }),
            keepalive: true,
          }).catch(() => {});
        } catch {}
      }}
      className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {tool.name}
          </h3>
          <span className="text-xs text-gray-400">{tool.category}</span>
        </div>
        <span
          className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
            tool.free
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-orange-50 text-orange-700 border border-orange-200"
          }`}
        >
          {tool.free ? "免费" : "付费"}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
        {tool.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {tool.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

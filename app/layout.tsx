import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "AI工具库 — 发现最好的AI工具",
  description: "精选AI工具合集，涵盖对话AI、图像生成、视频生成、编程辅助等分类，帮你找到最适合的AI工具",
  keywords: "AI工具,人工智能,ChatGPT,Midjourney,AI图像生成,AI视频",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

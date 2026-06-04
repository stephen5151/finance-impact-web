import type { Metadata } from "next";
import { Geist, Zhi_Mang_Xing, Caveat } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BackgroundDecor } from "@/components/BackgroundDecor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 手写体（手札体）由 next/font 在构建时打包、经本站域名分发，
// 不再依赖会被墙的 fonts.googleapis.com，保证 Android / Windows / 移动端也能显示。
// 中文手写体（毛笔手写风），覆盖没有系统手写字体的设备
const zhiMangXing = Zhi_Mang_Xing({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand-cn",
  display: "swap",
});
// 拉丁手写体
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand-en",
  display: "swap",
});

export const metadata: Metadata = {
  title: "事件影响推演 | 看懂大事，推演它会怎样影响你的生活",
  description:
    "把最近的政治经济事件，翻译成普通人能理解的生活影响推演。不是教你炒股，而是帮你理解未来可能发生什么。本网站仅用于信息理解与生活影响分析，不构成投资建议。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${zhiMangXing.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-stone-900">
        <BackgroundDecor />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

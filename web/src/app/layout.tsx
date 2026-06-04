import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BackgroundDecor } from "@/components/BackgroundDecor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="zh-CN" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        {/* 手札体「霞鹜文楷 Lite」：自托管在本站 /public，切片按需加载，
            同源分发，不依赖会被墙的 google 域名，Android / Windows / iOS 统一显示。 */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="/fonts/lxgw/lxgw.css" />
      </head>
      <body className="min-h-full flex flex-col text-stone-900">
        <BackgroundDecor />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

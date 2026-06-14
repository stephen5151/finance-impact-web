import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { getLang } from "@/i18n/lang";
import { ui } from "@/i18n/dict";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: ui[lang].meta.homeTitle,
    description: ui[lang].meta.homeDesc,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  return (
    <html
      lang={lang === "en" ? "en" : "zh-CN"}
      className={`${geistSans.variable} h-full antialiased`}
    >
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

import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import { SiteBackground } from "@/components/background/SiteBackground";
import "./globals.css";

// 英文衬线展示字体，绑定为 --font-serif 供大标题（如 Portfolio）使用
const fontSerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "蒋文喆 · 设计工程师 & 全栈开发者",
  description:
    "美团大众点评境外事业部设计工程师。体验设计、动效、AI 与全栈开发。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f5f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${fontSerif.variable} relative font-sans antialiased`}>
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}

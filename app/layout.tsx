import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteBackground } from "@/components/background/SiteBackground";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "蒋文喆 · 设计工程师 & 全栈开发者",
  description:
    "美团大众点评境外事业部设计工程师。体验设计、动效、AI 与全栈开发。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="relative font-sans antialiased">
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}

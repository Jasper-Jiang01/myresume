import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Playfair_Display } from "next/font/google";
import { SiteBackground } from "@/components/background/SiteBackground";
import ChatWidget from "@/components/myAgent/ChatWidget";
import { PreferenceToggles } from "@/components/preferences/PreferenceToggles";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { PREFERENCES_BOOTSTRAP_SCRIPT } from "@/lib/preferences/apply";
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
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${fontSerif.variable} relative font-sans antialiased`}
        suppressHydrationWarning
      >
        <Script
          id="preferences-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOTSTRAP_SCRIPT }}
        />
        <PreferencesProvider>
          <SiteBackground />
          {children}
          <ChatWidget />
          <div className="theme-fade-overlay" aria-hidden />
          <PreferenceToggles />
        </PreferencesProvider>
      </body>
    </html>
  );
}

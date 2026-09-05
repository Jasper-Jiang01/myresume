import type { Metadata, Viewport } from "next";
import nextDynamic from "next/dynamic";
import { Playfair_Display } from "next/font/google";
import { SiteBackground } from "@/components/background/SiteBackground";
import { ChatWidgetLoader } from "@/components/myAgent/ChatWidgetLoader";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { PREFERENCES_BOOTSTRAP_SCRIPT } from "@/lib/preferences/apply";
import "./globals.css";

const PreferenceToggles = nextDynamic(
  () =>
    import("@/components/preferences/PreferenceToggles").then(
      (mod) => mod.PreferenceToggles
    ),
  { ssr: false, loading: () => null }
);

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

export const dynamic =
  process.env.DEPLOY_TARGET === "node" ? "force-dynamic" : "auto";

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
        <script
          dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOTSTRAP_SCRIPT }}
        />
        <PreferencesProvider>
          <SiteBackground />
          {children}
          <PreferenceToggles />
          <ChatWidgetLoader />
          <div className="theme-fade-overlay" aria-hidden />
        </PreferencesProvider>
      </body>
    </html>
  );
}

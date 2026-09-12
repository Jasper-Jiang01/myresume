import type { ReactNode } from "react";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./website.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${jakarta.variable} ${cormorant.variable}`}>
      {children}
    </div>
  );
}

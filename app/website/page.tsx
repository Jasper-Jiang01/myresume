import type { Metadata } from "next";
import { WebsiteView } from "./_components/WebsiteView";

/**
 * /website 页面（Server Component）
 * 文案与案例数据在 ./_content/content.ts，交互与动效在 ./_components。
 */
export const metadata: Metadata = {
  title: "蒋文喆 · 网页版作品集",
  description:
    "设计工程师蒋文喆的网页版作品集。跨境支付、电力交易、官网与视觉练习。",
};

export default function WebsitePage() {
  return (
    <main className="relative z-10 bg-[#050606]">
      <WebsiteView />
    </main>
  );
}

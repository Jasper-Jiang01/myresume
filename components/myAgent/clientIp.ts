import { createHash } from "crypto";
import type { NextRequest } from "next/server";

/**
 * 只采信托管平台写入的地址，不采信客户端可伪造的 X-Forwarded-For 左侧值。
 * Vercel 会覆盖 x-vercel-forwarded-for / x-real-ip；其余环境只用转发链最后一跳。
 */
export function getRequestIp(req: NextRequest): string {
  const vercel = firstHop(req.headers.get("x-vercel-forwarded-for"));
  if (vercel) return normalizeIp(vercel);

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return normalizeIp(realIp);

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const peer = hops[hops.length - 1];
    if (peer) return normalizeIp(peer);
  }

  return "unknown";
}

export function hashIpForRateLimit(ip: string): string {
  return createHash("sha256").update(rateLimitIdentity(ip)).digest("hex");
}

function firstHop(value: string | null): string | null {
  if (!value) return null;
  const hop = value.split(",")[0]?.trim();
  return hop || null;
}

function normalizeIp(ip: string): string {
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

function rateLimitIdentity(ip: string): string {
  if (ip === "unknown") return "unknown";
  if (ip.includes(":")) {
    const groups = ip.split("::")[0].split(":").filter(Boolean);
    return `v6:${groups.slice(0, 4).join(":")}`;
  }
  return `v4:${ip}`;
}

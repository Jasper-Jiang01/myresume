import { NextRequest, NextResponse } from "next/server";
import { isUuid, loadOwnedHistory } from "@/components/myAgent/chatPersistence";
import { getSupabaseAdmin } from "@/components/myAgent/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";
    if (!deviceId || !isUuid(deviceId)) {
      return NextResponse.json(
        { error: "auth_error", message: "请先登录" },
        { status: 401 }
      );
    }

    const conversationId =
      req.nextUrl.searchParams.get("conversationId")?.trim() ?? "";
    if (!conversationId || !isUuid(conversationId)) {
      return NextResponse.json(
        { error: "invalid_request", message: "会话无效" },
        { status: 400 }
      );
    }

    const history = await loadOwnedHistory(
      getSupabaseAdmin(),
      deviceId,
      conversationId
    );
    if (!history.ok) {
      return NextResponse.json(
        { error: history.error, message: history.message },
        { status: history.status }
      );
    }

    return NextResponse.json({ messages: history.messages });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "加载历史记录失败";
    return NextResponse.json(
      { error: "request_failed", message },
      { status: 500 }
    );
  }
}

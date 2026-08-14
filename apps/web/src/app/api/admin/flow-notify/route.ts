import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nodeId, topicTitle, phones, testUrl } = body;

    if (!nodeId || !phones || !Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Missing nodeId or phones array." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Verify caller has admin privileges
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, phone, email")
      .eq("id", user.id)
      .single();

    const isAdmin =
      profile?.role === "admin" ||
      ["6381029380", "9876543210", "9486335870"].includes(profile?.phone || "") ||
      profile?.email === "aishleetechnology@gmail.com";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    // 2. Mark pending requests as notified in database
    const { error: updateError } = await supabase
      .from("pending_requests")
      .update({
        status: "notified",
        notified_at: new Date().toISOString(),
        notes: `Notified by admin for release of ${topicTitle}`,
      })
      .eq("node_id", nodeId)
      .eq("status", "pending");

    if (updateError) {
      console.error("[FlowNotify] DB update error:", updateError);
    }

    // 3. Log broadcast event in flow_analytics
    await supabase.from("flow_analytics").insert({
      event_type: "admin_release_broadcast_sent",
      node_id: nodeId,
      option_label: topicTitle,
      user_id: user.id,
      metadata: {
        sent_count: phones.length,
        phones,
        test_url: testUrl,
      },
    });

    return NextResponse.json({
      success: true,
      sentCount: phones.length,
      nodeId,
      topicTitle,
      message: `Successfully triggered notification for ${phones.length} student(s).`,
    });
  } catch (err: any) {
    console.error("[FlowNotify] Error processing broadcast:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

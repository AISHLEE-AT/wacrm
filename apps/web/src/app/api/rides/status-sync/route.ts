import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Ride Status & Webhook Sync Endpoint
 * Syncs ride state changes from WhatsApp confirmations, UPI payment callbacks, or driver actions.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ride_id, status, driver_id, payment_ref, cancel_reason } = body;

    if (!ride_id || !status) {
      return NextResponse.json(
        { error: "Missing required parameters: ride_id and status." },
        { status: 400 }
      );
    }

    const validStatuses = [
      "requested",
      "accepted",
      "driver_arrived",
      "in_progress",
      "completed",
      "paid",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (driver_id) updatePayload.driver_id = driver_id;
    if (payment_ref) updatePayload.payment_ref = payment_ref;
    if (cancel_reason) updatePayload.cancel_reason = cancel_reason;

    const { data, error } = await supabase
      .from("rides")
      .update(updatePayload)
      .eq("id", ride_id)
      .select()
      .single();

    if (error) {
      console.error("[RideStatusSync] DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ride: data,
      message: `Ride ${ride_id} status updated to ${status}.`,
    });
  } catch (err: any) {
    console.error("[RideStatusSync] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

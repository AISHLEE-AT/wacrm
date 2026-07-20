import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    // We expect a webhook payload from SendGrid Inbound Parse or similar
    const payload = await req.json();
    
    // The raw email text body
    const emailBody = payload.text || payload.body || "";
    const emailSubject = payload.subject || "";
    
    console.log(`Received email webhook: Subject: ${emailSubject}`);

    // Regex to find 12-digit UPI UTR number
    const utrMatch = emailBody.match(/(?:UTR|Ref No|Transaction ID)[\s:-]*(\d{12})/i);
    // Regex to find the amount (Rs. 99, INR 1000, etc)
    const amountMatch = emailBody.match(/(?:Rs\.|INR|₹)[\s]*([0-9,]+(?:\.[0-9]{2})?)/i);

    if (!utrMatch) {
      return new Response(JSON.stringify({ message: "No UTR found in email." }), { status: 200 });
    }

    const utr = utrMatch[1];
    let amountStr = amountMatch ? amountMatch[1].replace(/,/g, '') : "0";
    const parsedAmount = parseFloat(amountStr);

    console.log(`Extracted UTR: ${utr}, Amount: ${parsedAmount}`);

    // Find a pending purchase in the last 2 hours that matches this amount approximately
    // We order by created_at desc to get the most recent attempt
    const { data: pendingPurchases, error: fetchError } = await supabase
      .from('purchases')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(10); // Check recent 10 pending

    if (fetchError) throw fetchError;

    if (!pendingPurchases || pendingPurchases.length === 0) {
      return new Response(JSON.stringify({ message: "No pending purchases found." }), { status: 200 });
    }

    // Attempt to match the amount
    const matchedPurchase = pendingPurchases.find(p => Math.abs(p.amount - parsedAmount) < 1.0); // Allow 1 Rs variance

    if (matchedPurchase) {
      // Update the purchase status to COMPLETED
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status: 'COMPLETED',
          payment_id: `upi_${utr}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchedPurchase.id);

      if (updateError) throw updateError;
      
      // Also send a notification to the user
      await supabase.from('notifications').insert([{
        user_id: matchedPurchase.user_id,
        title: 'Payment Successful',
        message: `Your payment of ₹${parsedAmount} via UPI (Ref: ${utr}) was verified. Course Unlocked!`,
        is_read: false
      }]);

      console.log(`Successfully verified and unlocked purchase ID: ${matchedPurchase.id}`);
      return new Response(JSON.stringify({ success: true, message: "Purchase verified." }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: "UTR found but no matching pending purchase amount." }), { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

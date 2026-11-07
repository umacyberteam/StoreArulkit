import { createAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(request: Request, context: { params: { secret: string } }) {
  const secret = process.env.NEXAPAYZ_WEBHOOK_SECRET;

  if (!secret || !safeEqual(context.params.secret, secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const invoiceId = typeof payload.invoice_id === "string" ? payload.invoice_id : "";
  const amount = Number(payload.amount);
  const status = typeof payload.status === "string" ? payload.status.toLowerCase() : "";

  if (!invoiceId || !Number.isSafeInteger(amount) || amount < 0 ||
      !["paid", "expired", "failed"].includes(status)) {
    return Response.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const admin = createAdminSupabase();
  const { data: order, error } = await admin.from("orders")
    .select("id,amount,payment_status")
    .eq("invoice_id", invoiceId)
    .maybeSingle();

  if (error) return Response.json({ error: "Gagal memeriksa pesanan." }, { status: 500 });
  if (!order) return Response.json({ received: true });
  if (amount !== order.amount) {
    return Response.json({ error: "Nominal invoice tidak cocok." }, { status: 409 });
  }
  if (order.payment_status === "paid") return Response.json({ received: true });

  const update = status === "paid"
    ? { payment_status: "paid", paid_at: new Date().toISOString() }
    : { payment_status: status };

  let query = admin.from("orders").update(update).eq("id", order.id);

  if (status === "paid") {
    query = query.in("payment_status", ["pending", "expired", "failed"]);
  } else {
    query = query.eq("payment_status", "pending");
  }

  const { error: updateError } = await query;
  if (updateError) {
    return Response.json({ error: "Gagal memperbarui status." }, { status: 500 });
  }

  return Response.json({ received: true });
}

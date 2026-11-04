import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Silakan login." }, { status: 401 });

  const admin = createAdminSupabase();
  await admin.from("orders")
    .update({ payment_status: "expired" })
    .eq("user_id", user.id)
    .eq("payment_status", "pending")
    .not("expires_at", "is", null)
    .lt("expires_at", new Date().toISOString());

  const { data: orders, error } = await admin.from("orders")
    .select("id,amount,invoice_id,payment_status,created_at,paid_at,expires_at,fee,total,products(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: "Gagal mengambil riwayat transaksi." }, { status: 500 });
  return Response.json({ email: user.email, orders: orders ?? [] });
}

import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const auth = createServerSupabase();
  const { data: { user }, error: authError } = await auth.auth.getUser();
  if (authError || !user) return Response.json({ error: "Silakan login." }, { status: 401 });

  const admin = createAdminSupabase();
  const { data: order, error } = await admin.from("orders")
    .select("id,user_id,amount,invoice_id,payment_status,qris_image,payment_link,expires_at,fee,total,created_at,products(title)")
    .eq("id", context.params.id).eq("user_id", user.id).single();
  if (error || !order) return Response.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  return Response.json({ order });
}

import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, title, description, category, price, file_path, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: "Gagal mengambil produk." }, { status: 500 });
  return Response.json({ products: data ?? [] });
}

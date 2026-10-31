import { requireAdmin } from "@/lib/supabase/server";

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim();
  const price = Number(body.price);
  const is_active = Boolean(body.is_active);
  if (!title || !category || !Number.isSafeInteger(price) || price < 0) {
    return Response.json({ error: "Nama, kategori, dan harga yang valid wajib diisi." }, { status: 400 });
  }
  const { data, error } = await auth.supabase.from("products")
    .update({ title, category, description, price, is_active })
    .eq("id", context.params.id).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ product: data });
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { data: product, error: readError } = await auth.supabase.from("products")
    .select("id, file_path").eq("id", context.params.id).single();
  if (readError || !product) return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });

  const { error } = await auth.supabase.from("products").delete().eq("id", context.params.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (product.file_path) await auth.supabase.storage.from("product-files").remove([product.file_path]);
  return Response.json({ success: true });
}

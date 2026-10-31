import { requireAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { data, error } = await auth.supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const price = Number(form.get("price"));
  const file = form.get("file");
  if (!title || !category || !Number.isSafeInteger(price) || price < 0) {
    return Response.json({ error: "Nama, kategori, dan harga yang valid wajib diisi." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Pilih file ZIP produk terlebih dahulu." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".zip") || file.size > 100 * 1024 * 1024) {
    return Response.json({ error: "File harus ZIP dan ukurannya maksimal 100 MB." }, { status: 400 });
  }

  const slug = `${title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${crypto.randomUUID().slice(0, 8)}`;
  const filePath = `${auth.user!.id}/${crypto.randomUUID()}.zip`;
  const { error: uploadError } = await auth.supabase.storage.from("product-files").upload(filePath, file, {
    contentType: "application/zip", upsert: false,
  });
  if (uploadError) return Response.json({ error: `Upload gagal: ${uploadError.message}` }, { status: 500 });

  const { data, error } = await auth.supabase.from("products").insert({
    slug, title, category, description, price, file_path: filePath, is_active: true,
  }).select("*").single();
  if (error) {
    await auth.supabase.storage.from("product-files").remove([filePath]);
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ product: data }, { status: 201 });
}

import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const supabase = createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      { error: "Silakan login." },
      { status: 401 },
    );
  }

  const admin = createAdminSupabase();

  const { data: order, error } = await admin
    .from("orders")
    .select(
      "id,user_id,payment_status,products(file_path,original_file_name)",
    )
    .eq("id", context.params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return Response.json(
      { error: "Transaksi tidak ditemukan." },
      { status: 404 },
    );
  }

  if (order.payment_status !== "paid") {
    return Response.json(
      { error: "File hanya tersedia setelah pembayaran berhasil." },
      { status: 403 },
    );
  }

  const product = Array.isArray(order.products)
    ? order.products[0]
    : order.products;

  if (!product?.file_path) {
    return Response.json(
      { error: "File produk belum diunggah admin." },
      { status: 404 },
    );
  }

  const fallbackName =
    product.file_path.split("/").pop() || "produk";

  const downloadName =
    product.original_file_name || fallbackName;

  const { data, error: signedError } = await admin.storage
    .from("product-files")
    .createSignedUrl(product.file_path, 60, {
      download: downloadName,
    });

  if (signedError || !data?.signedUrl) {
    return Response.json(
      { error: "Gagal membuat link unduhan." },
      { status: 500 },
    );
  }

  return Response.redirect(data.signedUrl, 302);
}

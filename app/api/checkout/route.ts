import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = createServerSupabase();
    const { data: { user }, error: authError } = await auth.auth.getUser();
    if (authError || !user) return Response.json({ error: "Silakan login untuk checkout." }, { status: 401 });

    const body = await request.json().catch(() => null);
    const productId = typeof body?.product_id === "string" ? body.product_id : "";
    if (!productId) return Response.json({ error: "Produk tidak valid." }, { status: 400 });

    const { data: product, error: productError } = await auth.from("products")
      .select("id,title,price,is_active").eq("id", productId).eq("is_active", true).single();
    if (productError || !product) return Response.json({ error: "Produk tidak ditemukan atau nonaktif." }, { status: 404 });

    const apiKey = process.env.NEXAPAYZ_API_KEY;
    if (!apiKey) return Response.json({ error: "NEXAPAYZ_API_KEY belum diatur." }, { status: 500 });

    const admin = createAdminSupabase();
    const { data: order, error: insertError } = await admin.from("orders").insert({
      user_id: user.id, product_id: product.id, amount: product.price, payment_status: "pending",
    }).select("id").single();
    if (insertError || !order) return Response.json({ error: "Gagal membuat pesanan." }, { status: 500 });

    const url = new URL("https://nexapayz.alluffystore.my.id/api/invoice");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("amount", String(product.price));

    let response: Response;
    try { response = await fetch(url, { method: "GET", cache: "no-store" }); }
    catch {
      await admin.from("orders").delete().eq("id", order.id).eq("payment_status", "pending");
      return Response.json({ error: "Tidak bisa terhubung ke NexaPayz." }, { status: 502 });
    }

    const invoice = await response.json().catch(() => null);
    if (!response.ok || !invoice?.success || !invoice?.invoice_id || !invoice?.qris_image) {
      await admin.from("orders").delete().eq("id", order.id).eq("payment_status", "pending");
      return Response.json({ error: invoice?.message || "NexaPayz gagal membuat invoice." }, { status: 502 });
    }

    const { error: updateError } = await admin.from("orders").update({
      invoice_id: String(invoice.invoice_id),
      qris_image: String(invoice.qris_image),
      payment_link: invoice.payment_link ? String(invoice.payment_link) : null,
      expires_at: invoice.expired_at ? new Date(invoice.expired_at).toISOString() : null,
      fee: Number.isSafeInteger(invoice.fee) ? invoice.fee : 0,
      total: Number.isSafeInteger(invoice.total) ? invoice.total : product.price,
    }).eq("id", order.id);

    if (updateError) {
      await admin.from("orders").delete().eq("id", order.id).eq("payment_status", "pending");
      return Response.json({ error: "Invoice dibuat tetapi detail pesanan gagal disimpan. Hubungi admin sebelum membayar." }, { status: 500 });
    }

    return Response.json({ order_id: order.id, product: { title: product.title, price: product.price },
      invoice_id: invoice.invoice_id, amount: invoice.amount, fee: invoice.fee, total: invoice.total,
      qris_image: invoice.qris_image, payment_link: invoice.payment_link, expired_at: invoice.expired_at ?? null,
    }, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: "Terjadi kesalahan saat checkout." }, { status: 500 });
  }
}

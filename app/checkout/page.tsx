"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, LoaderCircle } from "lucide-react";
import { formatIDR } from "@/lib/products";

type Checkout = {
  order_id: string;
  product: { title: string; price: number };
  invoice_id: string;
  amount: number;
  fee: number;
  total: number;
  qris_image: string;
  payment_link?: string;
  expired_at: string | null;
};

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productId = params.get("product");

    if (!productId) {
      setError("Produk checkout tidak ditemukan.");
      setLoading(false);
      return;
    }

    let active = true;

    async function createInvoice() {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();

        if (res.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(`/checkout?product=${productId}`)}`);
          return;
        }

        if (!res.ok) throw new Error(data.error || "Gagal membuat invoice.");
        if (active) setCheckout(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Checkout gagal.");
      } finally {
        if (active) setLoading(false);
      }
    }

    createInvoice();
    return () => { active = false; };
  }, [params, router]);

  useEffect(() => {
    if (!checkout?.order_id) return;

    let active = true;
    let redirecting = false;

    const refresh = async () => {
      try {
        const res = await fetch(`/api/orders/${checkout.order_id}`, { cache: "no-store" });
        const data = await res.json();
        if (!active || !res.ok) return;

        const paymentStatus = data.order?.payment_status;
        if (!paymentStatus) return;

        setStatus(paymentStatus);

        if (paymentStatus === "paid" && !redirecting) {
          redirecting = true;
          router.replace(`/checkout/success?order=${encodeURIComponent(checkout.order_id)}`);
        }
      } catch {
        // Pemeriksaan berikutnya akan mencoba lagi.
      }
    };

    refresh();
    const timer = window.setInterval(refresh, 5000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [checkout?.order_id, router]);

  if (loading) {
    return <main className="hero-bg flex min-h-screen items-center justify-center"><p className="flex items-center gap-2 text-slate-500"><LoaderCircle size={18} className="animate-spin"/> Membuat invoice...</p></main>;
  }

  return (
    <main className="hero-bg min-h-screen px-4 py-10">
      <div className="mx-auto max-w-xl">
        <a href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/> Kembali ke toko</a>
        <section className="rounded-3xl border border-white bg-white p-6 shadow-soft sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-violet">ArulKit Store · Checkout</p>
          <h1 className="mt-2 text-2xl font-extrabold">Selesaikan pembayaran</h1>
          {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {checkout && <>
            <div className="mt-6 flex justify-between gap-4 border-b border-slate-100 pb-5">
              <div><p className="text-sm text-slate-500">Produk</p><b className="mt-1 block">{checkout.product.title}</b></div>
              <b>{formatIDR(checkout.product.price)}</b>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Harga produk</span><span>{formatIDR(checkout.amount)}</span></div>
              <div className="mt-2 flex justify-between"><span className="text-slate-500">Biaya layanan</span><span>{formatIDR(checkout.fee)}</span></div>
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold"><span>Total bayar</span><span>{formatIDR(checkout.total)}</span></div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm font-bold">Scan QRIS untuk membayar</p>
              <img src={checkout.qris_image} alt="QRIS pembayaran NexaPayz" className="mx-auto mt-3 aspect-square w-full max-w-[280px] rounded-xl border border-slate-100 object-contain"/>
              <p className="mt-3 text-xs text-slate-400">Invoice: {checkout.invoice_id}</p>
              {checkout.expired_at && <p className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500"><Clock3 size={13}/> Kedaluwarsa: {new Date(checkout.expired_at).toLocaleString("id-ID")}</p>}
              {checkout.payment_link && <a href={checkout.payment_link} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-bold text-violet underline">Buka halaman pembayaran</a>}
            </div>
            <div className={`mt-6 flex items-center gap-3 rounded-2xl p-4 ${status === "paid" ? "bg-emerald-50 text-emerald-700" : status === "expired" || status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
              {status === "paid" ? <CheckCircle2 size={20}/> : <Clock3 size={20}/>}
              <div>
                <b className="block text-sm">{status === "paid" ? "Pembayaran terkonfirmasi" : status === "expired" ? "Invoice kedaluwarsa" : status === "failed" ? "Pembayaran gagal" : "Menunggu pembayaran"}</b>
                <span className="text-xs">Status diperbarui otomatis setiap 5 detik.{status === "paid" ? " Mengalihkan ke halaman sukses..." : ""}</span>
              </div>
            </div>
            {(status === "expired" || status === "failed") && <a href="/profile" className="mt-5 block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold">Lihat transaksi di profil</a>}
          </>}
        </section>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="hero-bg flex min-h-screen items-center justify-center">Memuat checkout...</main>}><CheckoutContent/></Suspense>;
}

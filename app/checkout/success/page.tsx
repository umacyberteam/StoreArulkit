"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, Download, LoaderCircle, XCircle } from "lucide-react";
import { formatIDR } from "@/lib/products";

type Order = {
  id: string;
  payment_status: "pending" | "paid" | "expired" | "failed";
  amount: number;
  paid_at: string | null;
  products: { title: string } | { title: string }[] | null;
};

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const checkOrder = useCallback(async () => {
    if (!orderId) {
      setError("ID transaksi tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memeriksa transaksi.");
      setOrder(data.order);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memeriksa transaksi.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    checkOrder();
    const timer = window.setInterval(checkOrder, 5000);
    return () => window.clearInterval(timer);
  }, [checkOrder]);

  const product = Array.isArray(order?.products) ? order.products[0] : order?.products;
  const status = order?.payment_status;

  return (
    <main className="hero-bg flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-white bg-white p-7 text-center shadow-soft sm:p-10">
        {loading ? <>
          <LoaderCircle size={48} className="mx-auto animate-spin text-violet"/>
          <h1 className="mt-5 text-2xl font-extrabold">Memeriksa pembayaran</h1>
          <p className="mt-2 text-sm text-slate-500">Sedang memverifikasi status transaksi.</p>
        </> : error ? <>
          <XCircle size={52} className="mx-auto text-red-500"/>
          <h1 className="mt-5 text-2xl font-extrabold">Transaksi tidak ditemukan</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Link href="/profile" className="mt-7 inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white">Buka profil</Link>
        </> : status === "paid" ? <>
          <CheckCircle2 size={60} className="mx-auto text-emerald-500"/>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[.18em] text-emerald-600">Pembayaran berhasil</p>
          <h1 className="mt-2 text-3xl font-extrabold">Terima kasih!</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">Pembayaran sudah dikonfirmasi. Produk digital sekarang tersedia untuk diunduh.</p>

          <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
            <p className="text-xs text-slate-500">Produk</p>
            <b className="mt-1 block">{product?.title || "Produk digital"}</b>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="text-slate-500">Total pembayaran</span>
              <b>{formatIDR(order!.amount)}</b>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-bold text-emerald-600">Berhasil</span>
            </div>
          </div>

          <a href={`/api/orders/${encodeURIComponent(orderId!)}/download`} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-violet-700">
            <Download size={19}/> Download Produk
          </a>
          <Link href="/profile" className="mt-4 inline-block text-sm font-bold text-slate-500 underline">Lihat riwayat transaksi</Link>
        </> : status === "expired" || status === "failed" ? <>
          <XCircle size={56} className="mx-auto text-red-500"/>
          <h1 className="mt-5 text-2xl font-extrabold">Pembayaran tidak berhasil</h1>
          <p className="mt-2 text-sm text-slate-500">{status === "expired" ? "Invoice sudah kedaluwarsa." : "Pembayaran gagal diproses."}</p>
          <Link href="/profile" className="mt-7 inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white">Lihat transaksi</Link>
        </> : <>
          <Clock3 size={54} className="mx-auto text-amber-500"/>
          <h1 className="mt-5 text-2xl font-extrabold">Menunggu konfirmasi</h1>
          <p className="mt-2 text-sm text-slate-500">Pembayaran belum dikonfirmasi oleh penyedia pembayaran. Halaman ini akan memeriksa ulang secara otomatis setiap 5 detik.</p>
          <button onClick={checkOrder} className="mt-7 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white">Periksa sekarang</button>
        </>}
      </section>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense fallback={<main className="hero-bg flex min-h-screen items-center justify-center"><LoaderCircle className="animate-spin"/></main>}><SuccessContent/></Suspense>;
}

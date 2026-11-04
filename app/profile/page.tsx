"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Download, LogOut, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { formatIDR } from "@/lib/products";

type Order = {
  id: string;
  amount: number;
  invoice_id: string | null;
  payment_status: "pending" | "paid" | "expired" | "failed";
  created_at: string;
  fee: number;
  total: number | null;
  products: { title: string } | { title: string }[] | null;
};

function getStatus(status: Order["payment_status"]) {
  if (status === "paid") return { label: "Berhasil", className: "bg-emerald-50 text-emerald-700", Icon: CheckCircle2 };
  if (status === "expired" || status === "failed") return { label: "Dibatalkan", className: "bg-red-50 text-red-700", Icon: XCircle };
  return { label: "Pending", className: "bg-amber-50 text-amber-800", Icon: Clock3 };
}

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) {
        router.replace("/login?next=/profile");
        return;
      }
      if (!response.ok) throw new Error(data.error || "Gagal memuat transaksi.");
      setEmail(data.email ?? "");
      setOrders(data.orders ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrders();
    const timer = window.setInterval(loadOrders, 10000);
    return () => window.clearInterval(timer);
  }, [loadOrders]);

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  function download(orderId: string) {
    window.location.assign(`/api/orders/${orderId}/download`);
  }

  return (
    <main className="hero-bg min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500">
          <ArrowLeft size={16} /> Kembali ke toko
        </a>
        <section className="rounded-3xl border border-white bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-violet">Akun ArulKit Store</p>
              <h1 className="mt-2 text-2xl font-extrabold">Profil</h1>
              <p className="mt-2 text-sm text-slate-500">{email || "Memuat email..."}</p>
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-white bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-xl font-extrabold">Riwayat transaksi</h2>
          <p className="mt-1 text-sm text-slate-500">Status diperbarui otomatis setiap 10 detik.</p>
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">Memuat transaksi...</p>
          ) : orders.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">Belum ada transaksi.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {orders.map((order) => {
                const status = getStatus(order.payment_status);
                const StatusIcon = status.Icon;
                const product = Array.isArray(order.products) ? order.products[0] : order.products;
                return (
                  <article key={order.id} className="rounded-2xl border border-slate-100 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold">{product?.title ?? "Produk ArulKit"}</h3>
                        <p className="mt-1 text-xs text-slate-400">{new Date(order.created_at).toLocaleString("id-ID")}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}>
                        <StatusIcon size={14} /> {status.label}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-400">Total transaksi</p>
                        <b className="mt-1 block">{formatIDR(order.total ?? order.amount + order.fee)}</b>
                        {order.invoice_id && <p className="mt-1 text-[11px] text-slate-400">Invoice: {order.invoice_id}</p>}
                      </div>
                      {order.payment_status === "paid" && (
                        <button onClick={() => download(order.id)} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold">
                          <Download size={16} /> Download
                        </button>
                      )}
                      {order.payment_status === "pending" && <span className="text-xs text-amber-700">Menunggu pembayaran</span>}
                      {(order.payment_status === "expired" || order.payment_status === "failed") && <span className="text-xs text-red-600">Waktu pembayaran berakhir</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

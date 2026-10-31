"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Edit3, PackagePlus, Trash2 } from "lucide-react";

type Product = { id: string; title: string; category: string; price: number; is_active: boolean; file_path: string | null };
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() { setLoading(true); try { const r = await fetch("/api/admin/products"); const d = await r.json(); if (!r.ok) throw new Error(d.error); setProducts(d.products ?? []); } catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat produk."); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function remove(id: string, title: string) {
    if (!window.confirm(`Hapus produk “${title}”? File ZIP-nya juga akan dihapus.`)) return;
    const r = await fetch(`/api/admin/products/${id}`, { method: "DELETE" }); const d = await r.json();
    if (!r.ok) { setError(d.error ?? "Gagal menghapus produk."); return; }
    setProducts(current => current.filter(p => p.id !== id));
  }
  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">KATALOG</p><h1>Produk</h1><p className="admin-subtitle">Kelola produk yang tampil di halaman toko.</p></div><Link href="/admin/products/new" className="admin-primary"><PackagePlus size={17}/> Tambah produk</Link></div>
    {error && <p className="admin-alert error">{error}</p>}
    <section className="admin-panel"><div className="admin-section-heading"><div><h2>Semua produk</h2><p>{products.length} produk terdaftar</p></div></div>
      {loading ? <div className="admin-empty">Memuat produk...</div> : products.length === 0 ? <div className="admin-empty"><PackagePlus size={28}/><b>Katalog masih kosong</b><span>Produk yang ditambahkan akan muncul di halaman utama toko.</span><Link href="/admin/products/new" className="admin-primary mt-2">Tambah produk</Link></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Nama produk</th><th>Kategori</th><th>Harga</th><th>File ZIP</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{products.map(p => <tr key={p.id}><td className="font-bold">{p.title}</td><td>{p.category}</td><td>{money(p.price)}</td><td><span className="text-xs">{p.file_path ? "Tersimpan" : "Belum ada"}</span></td><td><span className={`admin-status ${p.is_active ? "on" : "off"}`}>{p.is_active ? "Aktif" : "Nonaktif"}</span></td><td><div className="flex gap-2"><Link href={`/admin/products/${p.id}`} title="Edit" className="admin-icon-button"><Edit3 size={16}/></Link><button onClick={() => remove(p.id, p.title)} title="Hapus" className="admin-icon-button danger"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}
    </section>
  </>;
}

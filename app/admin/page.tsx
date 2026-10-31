"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Package, Plus, ShoppingBag } from "lucide-react";

type Product = { id: string; title: string; category: string; price: number; is_active: boolean };
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/admin/products").then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setProducts(d.products ?? []); }).catch(e => setError(e.message)); }, []);
  const active = products.filter(p => p.is_active).length;
  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">OVERVIEW</p><h1>Dashboard</h1><p className="admin-subtitle">Ringkasan pengelolaan ArulKit Store.</p></div><Link href="/admin/products/new" className="admin-primary"><Plus size={17}/> Tambah produk</Link></div>
    {error && <p className="admin-alert error">{error}</p>}
    <div className="admin-stats"><article className="admin-stat"><span className="admin-stat-icon purple"><Package/></span><p>Total produk</p><strong>{products.length}</strong><small>Produk tersimpan di database</small></article><article className="admin-stat"><span className="admin-stat-icon green"><ShoppingBag/></span><p>Produk aktif</p><strong>{active}</strong><small>Tampil di katalog toko</small></article><article className="admin-stat"><span className="admin-stat-icon blue"><ArrowUpRight/></span><p>Produk nonaktif</p><strong>{products.length - active}</strong><small>Disembunyikan dari katalog</small></article></div>
    <section className="admin-panel mt-7"><div className="admin-section-heading"><div><h2>Produk terbaru</h2><p>Produk yang baru ditambahkan ke toko.</p></div><Link href="/admin/products" className="admin-text-link">Lihat semua <ArrowUpRight size={15}/></Link></div>
      {products.length === 0 ? <div className="admin-empty"><Package size={28}/><b>Belum ada produk</b><span>Tambahkan produk pertama untuk mulai mengisi katalog.</span><Link href="/admin/products/new" className="admin-primary mt-2"><Plus size={16}/> Tambah produk</Link></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Nama produk</th><th>Kategori</th><th>Harga</th><th>Status</th></tr></thead><tbody>{products.slice(0, 5).map(p => <tr key={p.id}><td className="font-bold">{p.title}</td><td>{p.category}</td><td>{money(p.price)}</td><td><span className={`admin-status ${p.is_active ? "on" : "off"}`}>{p.is_active ? "Aktif" : "Nonaktif"}</span></td></tr>)}</tbody></table></div>}
    </section>
  </>;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, FileArchive, Save } from "lucide-react";

type ExistingProduct = { id: string; title: string; category: string; description: string; price: number; is_active: boolean; file_path: string | null };

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const editing = Boolean(productId);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Website & Template");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [existing, setExisting] = useState<ExistingProduct | null>(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;
    fetch("/api/admin/products").then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); const found = (d.products as ExistingProduct[]).find(p => p.id === productId); if (!found) throw new Error("Produk tidak ditemukan."); setExisting(found); setTitle(found.title); setCategory(found.category); setDescription(found.description); setPrice(String(found.price)); setIsActive(found.is_active); }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [productId]);

  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      if (editing) {
        const response = await fetch(`/api/admin/products/${productId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, category, description, price: Number(price), is_active: isActive }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan perubahan.");
      } else {
        const form = new FormData(); form.set("title", title); form.set("category", category); form.set("description", description); form.set("price", price); if (file) form.set("file", file);
        const response = await fetch("/api/admin/products", { method: "POST", body: form });
        const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Gagal menambahkan produk.");
      }
      router.push("/admin/products"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Terjadi kesalahan."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="admin-panel p-8">Memuat data produk...</div>;
  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">MANAJEMEN PRODUK</p><h1>{editing ? "Edit produk" : "Tambah produk"}</h1><p className="admin-subtitle">{editing ? "Perbarui informasi produk yang sudah ada." : "Masukkan detail produk dan unggah file ZIP."}</p></div><Link href="/admin/products" className="admin-secondary"><ArrowLeft size={16}/> Kembali</Link></div>
    <form onSubmit={submit} className="admin-panel admin-form">
      {error && <p className="admin-alert error">{error}</p>}
      <div className="admin-form-grid"><label className="admin-field"><span>Nama produk *</span><input required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Website Starter Kit"/></label><label className="admin-field"><span>Kategori *</span><select required value={category} onChange={e => setCategory(e.target.value)}><option>Website & Template</option><option>Bot & Automation</option><option>Scraper & Tools</option><option>API & Developer Tools</option><option>Lainnya</option></select></label></div>
      <label className="admin-field"><span>Deskripsi</span><textarea rows={4} maxLength={1000} value={description} onChange={e => setDescription(e.target.value)} placeholder="Jelaskan isi dan fungsi produk..."/></label>
      <div className="admin-form-grid"><label className="admin-field"><span>Harga (Rupiah) *</span><input required type="number" min="0" step="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="25000"/></label>{editing ? <label className="admin-field"><span>Status produk</span><select value={isActive ? "active" : "inactive"} onChange={e => setIsActive(e.target.value === "active")}><option value="active">Aktif - tampil di toko</option><option value="inactive">Nonaktif - disembunyikan</option></select></label> : <div className="admin-field"><span>Status produk</span><div className="admin-info-box">Produk baru langsung aktif dan tampil di katalog.</div></div>}</div>
      {!editing && <div className="admin-field"><span>File produk (ZIP) *</span><label className="admin-upload"><FileArchive size={25}/><b>{file ? file.name : "Pilih file ZIP"}</b><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Maksimal 100 MB. File disimpan di bucket privat."}</small><input type="file" accept=".zip,application/zip" required onChange={e => setFile(e.target.files?.[0] ?? null)}/></label></div>}
      {editing && <div className="admin-info-box">File ZIP saat ini: <b>{existing?.file_path ? "tersimpan di Storage privat" : "belum terpasang"}</b>. Penggantian file belum tersedia di form ini.</div>}
      <div className="admin-form-actions"><Link href="/admin/products" className="admin-secondary">Batal</Link><button disabled={saving} className="admin-primary" type="submit"><Save size={17}/>{saving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Simpan produk"}</button></div>
    </form>
  </>;
}

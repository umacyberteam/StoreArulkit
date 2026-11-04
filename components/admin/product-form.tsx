"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, DragEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, FileCode2, Save, UploadCloud, X } from "lucide-react";

type ExistingProduct = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  is_active: boolean;
  file_path: string | null;
};

const ACCEPTED_EXTENSIONS = [
  ".zip", ".js", ".ts", ".py", ".html", ".css", ".json", ".txt",
];

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const editing = Boolean(productId);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Website & Template");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [existing, setExisting] = useState<ExistingProduct | null>(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;

    fetch("/api/admin/products")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);

        const found = (d.products as ExistingProduct[]).find(
          (p) => p.id === productId,
        );

        if (!found) throw new Error("Produk tidak ditemukan.");

        setExisting(found);
        setTitle(found.title);
        setCategory(found.category);
        setDescription(found.description);
        setPrice(String(found.price));
        setIsActive(found.is_active);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  function validateAndSetFile(nextFile?: File) {
    if (!nextFile) return;

    const lowerName = nextFile.name.toLowerCase();

    if (!ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
      setError(
        "Format file tidak didukung. Gunakan ZIP, JS, TS, PY, HTML, CSS, JSON, atau TXT.",
      );
      return;
    }

    if (nextFile.size <= 0 || nextFile.size > MAX_FILE_SIZE) {
      setError("Ukuran file harus lebih dari 0 dan maksimal 100 MB.");
      return;
    }

    setError("");
    setFile(nextFile);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!editing && !file) {
        throw new Error("Pilih atau tarik file produk terlebih dahulu.");
      }

      if (editing) {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            category,
            description,
            price: Number(price),
            is_active: isActive,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Gagal menyimpan perubahan.");
        }
      } else {
        const form = new FormData();

        form.set("title", title);
        form.set("category", category);
        form.set("description", description);
        form.set("price", price);
        form.set("file", file!);

        const response = await fetch("/api/admin/products", {
          method: "POST",
          body: form,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Gagal menambahkan produk.");
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="admin-panel p-8">Memuat data produk...</div>;
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">MANAJEMEN PRODUK</p>
          <h1>{editing ? "Edit produk" : "Tambah produk"}</h1>
          <p className="admin-subtitle">
            {editing
              ? "Perbarui informasi produk yang sudah ada."
              : "Masukkan detail produk dan unggah file source code atau arsip."}
          </p>
        </div>

        <Link href="/admin/products" className="admin-secondary">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <form onSubmit={submit} className="admin-panel admin-form">
        {error && <p className="admin-alert error">{error}</p>}

        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Nama produk *</span>
            <input
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Website Starter Kit"
            />
          </label>

          <label className="admin-field">
            <span>Kategori *</span>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Website & Template</option>
              <option>Bot & Automation</option>
              <option>Scraper & Tools</option>
              <option>API & Developer Tools</option>
              <option>Lainnya</option>
            </select>
          </label>
        </div>

        <label className="admin-field">
          <span>Deskripsi</span>
          <textarea
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan isi dan fungsi produk..."
          />
        </label>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Harga (Rupiah) *</span>
            <input
              required
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="25000"
            />
          </label>

          {editing ? (
            <label className="admin-field">
              <span>Status produk</span>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
              >
                <option value="active">Aktif - tampil di toko</option>
                <option value="inactive">Nonaktif - disembunyikan</option>
              </select>
            </label>
          ) : (
            <div className="admin-field">
              <span>Status produk</span>
              <div className="admin-info-box">
                Produk baru langsung aktif dan tampil di katalog.
              </div>
            </div>
          )}
        </div>

        {!editing && (
          <div className="admin-field">
            <span>File produk *</span>

            <label
              htmlFor="product-file"
              onDragEnter={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();

                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragging(false);
                }
              }}
              onDrop={handleDrop}
              className={`admin-upload flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition ${
                dragging
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-300 hover:border-violet-400 hover:bg-violet-50/40"
              }`}
            >
              <UploadCloud size={30} />

              <b>
                {file
                  ? file.name
                  : "Tarik dan lepas file di sini"}
              </b>

              <small>
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "atau klik untuk memilih file • ZIP, JS, TS, PY, HTML, CSS, JSON, TXT • Maks. 100 MB"}
              </small>

              <input
                ref={inputRef}
                id="product-file"
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(",")}
                className="sr-only"
                onChange={(e) => validateAndSetFile(e.target.files?.[0])}
              />
            </label>

            {file && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <FileCode2 size={16} />
                  <span className="truncate">{file.name}</span>
                </span>

                <button
                  type="button"
                  aria-label="Hapus file pilihan"
                  onClick={() => {
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="rounded-lg p-1 hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {editing && (
          <div className="admin-info-box">
            File produk saat ini:{" "}
            <b>
              {existing?.file_path
                ? "tersimpan di Storage privat"
                : "belum terpasang"}
            </b>
            . Penggantian file belum tersedia di form ini.
          </div>
        )}

        <div className="admin-form-actions">
          <Link href="/admin/products" className="admin-secondary">
            Batal
          </Link>

          <button
            disabled={saving}
            className="admin-primary"
            type="submit"
          >
            <Save size={17} />
            {saving
              ? "Menyimpan..."
              : editing
                ? "Simpan perubahan"
                : "Simpan produk"}
          </button>
        </div>
      </form>
    </>
  );
}

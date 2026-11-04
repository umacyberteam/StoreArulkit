 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Bot,
  Check,
  Code2,
  Download,
  FileArchive,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { formatIDR, type Product } from "@/lib/products";
import { createClient } from "@/lib/supabase";

const iconMap = {
  code: Code2,
  bot: Bot,
  search: Search,
  terminal: Terminal,
};

const categories = [
  "Semua Produk",
  "Website & Template",
  "Bot & Automation",
  "Scraper & Tools",
];

export default function Storefront() {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [category, setCategory] = useState("Semua Produk");
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserEmail(session?.user?.email ?? null);
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/products")
      .then(async (r) => {
        const d = await r.json();

        if (!r.ok) throw new Error(d.error);

        if (active) {
          setCatalog(
            (d.products ?? []).map((p: any) => ({
              id: p.id,
              title: p.title,
              category: p.category,
              description: p.description,
              price: p.price,
              icon: (
                p.category.toLowerCase().includes("bot")
                  ? "bot"
                  : p.category.toLowerCase().includes("scraper")
                    ? "search"
                    : p.category.toLowerCase().includes("api")
                      ? "terminal"
                      : "code"
              ) as Product["icon"],
              version: "1.0.0",
              fileSize: "ZIP",
            })),
          );
        }
      })
      .catch(() => {
        if (active) setCatalog([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      catalog.filter(
        (p) =>
          (category === "Semua Produk" || p.category === category) &&
          `${p.title} ${p.description} ${p.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [category, query, catalog],
  );

  return (
    <main>
      <header className="sticky top-0 z-40 border-b border-[#eceef5] glass">
        <div className="container flex h-[76px] items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7657f6] text-white shadow-lg shadow-violet-200">
              <Code2 size={23} />
            </span>
            <span>
              <span className="brand block text-[17px] font-extrabold tracking-tight">
                ArulKit <span className="text-violet">Store</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-[.18em] text-slate-400">
                DIGITAL GOODS
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a className="hover:text-violet" href="#produk">Produk</a>
            <a className="hover:text-violet" href="#keunggulan">Keunggulan</a>
            <a className="hover:text-violet" href="#faq">FAQ</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={userEmail ? "/profile" : "/login"}
              className="rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-slate-100"
            >
              {userEmail ? "Profil" : "Masuk"}
            </a>
            <a
              href="#produk"
              className="btn-primary rounded-xl px-5 py-3 text-sm font-bold"
            >
              Lihat Koleksi <ArrowRight className="ml-2 inline" size={16} />
            </a>
          </div>

          <button
            aria-label="Menu"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-xl border p-2 md:hidden"
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenu && (
          <div className="container grid gap-3 pb-4 text-sm font-semibold md:hidden">
            <a href="#produk" onClick={() => setMobileMenu(false)}>Produk</a>
            <a href="#keunggulan" onClick={() => setMobileMenu(false)}>Keunggulan</a>
            <a
              href={userEmail ? "/profile" : "/login"}
              onClick={() => setMobileMenu(false)}
            >
              {userEmail ? "Profil" : "Masuk atau Daftar"}
            </a>
          </div>
        )}
      </header>

      <section className="hero-bg relative overflow-hidden">
        <div className="container grid min-h-[570px] items-center gap-10 py-16 md:grid-cols-[1.08fr_.92fr] md:py-20">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-xs font-bold text-violet shadow-sm">
              <Sparkles size={15} /> SOURCE CODE • DIGITAL SOLUTIONS
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-[-.045em] sm:text-5xl lg:text-[62px]">
              Wujudkan ide digital Anda, <span className="text-violet">mulai bersama ArulKit.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
              Temukan koleksi source code, template website, bot, dan perangkat
              digital yang dirancang untuk mendukung pengembangan proyek Anda.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#produk"
                className="btn-primary rounded-xl px-6 py-4 text-sm font-bold"
              >
                Jelajahi Katalog <ArrowRight className="ml-2 inline" size={17} />
              </a>
              <a
                href="#keunggulan"
                className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 hover:border-violet-200"
              >
                Tentang ArulKit
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" /> Produk Digital
              </span>
              <span className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" /> Akses Digital Instan
              </span>
              <span className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" /> Dirancang untuk Developer
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[470px]">
            <div className="absolute -inset-6 rounded-[40px] bg-violet-200/40 blur-3xl"></div>
            <div className="relative rounded-[30px] border border-white bg-white p-5 shadow-[0_25px_80px_rgba(69,55,140,.14)] sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">
                    ArulKit Library
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold">Koleksi Unggulan</h3>
                </div>
                <span className="rounded-xl bg-violet-50 p-3 text-violet">
                  <FileArchive size={22} />
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {catalog.slice(0, 3).map((p, i) => {
                  const Icon = iconMap[p.icon];

                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/40"
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          i === 1
                            ? "bg-sky-50 text-sky-600"
                            : i === 2
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-violet-50 text-violet"
                        }`}
                      >
                        <Icon size={23} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-extrabold">
                          {p.title}
                        </span>
                        <span className="mt-1 block text-xs text-slate-400">
                          {p.category} · ZIP
                        </span>
                      </span>

                      <span className="text-sm font-extrabold">
                        {formatIDR(p.price)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f8f7ff] p-4">
                <span className="rounded-xl bg-white p-2 text-violet shadow-sm">
                  <Zap size={18} />
                </span>
                <span>
                  <b className="block text-sm">
                    Solusi Digital untuk Berbagai Kebutuhan
                  </b>
                  <span className="mt-1 block text-xs text-slate-500">
                    Source code lengkap dengan dokumentasi produk
                  </span>
                </span>
                <ArrowDownRight className="ml-auto text-violet" size={20} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="produk" className="container scroll-mt-24 py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[.2em] text-violet">
              Katalog Produk
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Temukan Solusi untuk Proyek Anda.
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-500">
              Jelajahi berbagai produk digital yang tersedia. Informasi produk
              dan harga diperbarui langsung berdasarkan katalog resmi ArulKit Store.
            </p>
          </div>

          <div className="relative w-full md:max-w-[300px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk berdasarkan nama atau kategori..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                category === c
                  ? "bg-[#171a2e] text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const Icon = iconMap[p.icon];

            return (
              <article
                key={p.id}
                className="product-card rounded-[24px] border border-slate-100 bg-white p-5 shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet">
                    <Icon size={26} />
                  </div>
                  {p.badge && (
                    <span className="pill rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wide">
                      {p.badge}
                    </span>
                  )}
                </div>

                <p className="mt-5 text-xs font-bold text-violet">{p.category}</p>
                <h3 className="mt-2 text-lg font-extrabold">{p.title}</h3>
                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                  {p.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                  <FileArchive size={15} /> ZIP · {p.fileSize}
                  <span className="mx-1">•</span>v{p.version}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                  <div>
                    {p.oldPrice && (
                      <p className="text-xs text-slate-400 line-through">
                        {formatIDR(p.oldPrice)}
                      </p>
                    )}
                    <p className="text-lg font-extrabold">{formatIDR(p.price)}</p>
                  </div>

                  <button
                    onClick={() => setSelected(p)}
                    className="btn-primary rounded-xl px-4 py-3 text-sm font-bold"
                  >
                    Lihat Detail <ArrowRight className="ml-1 inline" size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">
            Produk tidak ditemukan. Silakan gunakan kata kunci atau kategori lainnya.
          </div>
        )}
      </section>

      <section
        id="keunggulan"
        className="border-y border-slate-100 bg-white py-20"
      >
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-[.2em] text-violet">
              DIBUAT UNTUK DEVELOPER
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Fokus pada Pengembangan, Tanpa Proses yang Rumit.
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              Setiap proses dirancang agar sederhana dan efisien, sehingga Anda
              dapat lebih fokus mengembangkan proyek.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Download,
                title: "Akses Produk Digital",
                desc: "File produk dapat diakses setelah pembayaran berhasil diverifikasi oleh sistem.",
              },
              {
                icon: ShieldCheck,
                title: "Transaksi Terverifikasi",
                desc: "Setiap pembayaran diproses melalui sistem backend dengan pencatatan status transaksi.",
              },
              {
                icon: Code2,
                title: "Solusi untuk Developer",
                desc: "Tersedia berbagai produk digital, mulai dari source code website, bot, scraper, hingga perangkat pengembangan lainnya.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-100 bg-[#fafaff] p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet shadow-sm">
                  <Icon size={23} />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="container py-20">
        <div className="grid gap-10 md:grid-cols-[.8fr_1.2fr]">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[.2em] text-violet">
              FAQ
            </span>
            <h2 className="mt-3 text-3xl font-extrabold">
              Pertanyaan yang Sering Diajukan.
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              Temukan informasi penting mengenai produk, pembayaran, dan akses
              pembelian sebelum melakukan transaksi.
            </p>
          </div>

          <div className="space-y-3">
            {[
              [
                "Apa saja jenis produk yang tersedia?",
                "ArulKit Store menyediakan berbagai produk digital berupa file ZIP yang mencakup source code, template website, bot, scraper, dan perangkat pengembangan lainnya.",
              ],
              [
                "Kapan produk dapat diunduh?",
                "Produk dapat diunduh setelah pembayaran berhasil dikonfirmasi oleh sistem melalui akses unduhan yang telah disediakan.",
              ],
              [
                "Apakah tersedia login menggunakan Google?",
                "Ya. Anda dapat menggunakan akun Google apabila layanan autentikasi Google telah tersedia dan dikonfigurasi.",
              ],
              [
                "Bagaimana informasi harga produk diperbarui?",
                "Informasi harga dan ketersediaan produk mengikuti data terbaru yang dikelola oleh administrator melalui dashboard.",
              ],
            ].map(([q, a]) => (
              <details
                key={q}
                className="group rounded-2xl border border-slate-200 bg-white p-5"
              >
                <summary className="cursor-pointer list-none pr-6 font-bold">
                  {q}
                  <span className="float-right text-violet">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-500">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#111427] py-10 text-white">
        <div className="container flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet">
              <Code2 />
            </span>
            <div>
              <b className="brand">ArulKit Store</b>
              <p className="mt-1 text-xs text-slate-400">
                Digital Solutions for Developers.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} ArulKit Store. All rights reserved.
          </p>
        </div>
      </footer>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101426]/55 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet">
                {(() => {
                  const Icon = iconMap[selected.icon];
                  return <Icon size={26} />;
                })()}
              </span>

              <button
                onClick={() => setSelected(null)}
                aria-label="Tutup"
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-5 text-xs font-bold text-violet">
              {selected.category}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold">{selected.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {selected.description}
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Format</span>
                <b>ZIP archive</b>
              </div>
              <div className="mt-3 flex justify-between">
                <span className="text-slate-500">Ukuran</span>
                <b>{selected.fileSize}</b>
              </div>
              <div className="mt-3 flex justify-between">
                <span className="text-slate-500">Versi</span>
                <b>{selected.version}</b>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-xl font-extrabold">
                {formatIDR(selected.price)}
              </span>

              <a
                href={
                  userEmail
                    ? `/checkout?product=${selected.id}`
                    : `/login?next=${encodeURIComponent(
                        `/checkout?product=${selected.id}`,
                      )}`
                }
                className="btn-primary rounded-xl px-5 py-3 text-sm font-bold"
              >
                {userEmail ? "Lanjutkan Pembelian" : "Masuk untuk Melanjutkan"}{" "}
                <ArrowRight className="ml-1 inline" size={15} />
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

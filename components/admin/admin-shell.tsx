"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Boxes, LayoutDashboard, LogOut, PackagePlus, ShoppingBag } from "lucide-react";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) { router.replace(`/login?next=${encodeURIComponent(pathname)}`); return; }
        const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        if (profileError || profile?.role !== "admin") { if (active) setDenied(true); return; }
        if (active) setEmail(user.email ?? "Admin");
      } catch { if (active) setDenied(true); }
      finally { if (active) setChecking(false); }
    }
    check();
    return () => { active = false; };
  }, [pathname, router]);

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (checking) return <main className="admin-screen"><div className="admin-loading">Memeriksa akses admin...</div></main>;
  if (denied) return <main className="admin-screen"><section className="admin-panel max-w-lg text-center"><div className="admin-icon mx-auto"><Boxes/></div><h1 className="mt-4 text-2xl font-extrabold">Akses ditolak</h1><p className="mt-2 text-sm text-slate-500">Akun ini belum memiliki role admin. Atur role melalui Supabase SQL Editor.</p><Link href="/" className="admin-primary mt-6 inline-flex">Kembali ke toko</Link></section></main>;

  const nav = [
    { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produk", icon: ShoppingBag },
    { href: "/admin/products/new", label: "Tambah produk", icon: PackagePlus },
  ];
  return <div className="admin-layout">
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand"><span className="admin-brand-mark"><Boxes size={20}/></span><span>ArulKit <b>Admin</b></span></Link>
      <p className="admin-nav-label">MENU UTAMA</p>
      <nav className="grid gap-1">{nav.map(item => {
        const Icon = item.icon; const active = item.href === "/admin" ? pathname === item.href : pathname === item.href || (item.href === "/admin/products" && pathname.startsWith("/admin/products/"));
        return <Link key={item.href} href={item.href} className={`admin-nav-item ${active ? "active" : ""}`}><Icon size={18}/>{item.label}</Link>;
      })}</nav>
      <div className="admin-sidebar-bottom"><span className="admin-avatar">{email.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><b className="block truncate text-xs">{email}</b><small className="text-slate-400">Administrator</small></span><button onClick={logout} title="Keluar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><LogOut size={17}/></button></div>
    </aside>
    <main className="admin-main"><header className="admin-topbar"><div><span className="text-xs font-bold uppercase tracking-[.16em] text-violet">ArulKit Store</span><p className="mt-1 text-sm font-semibold text-slate-500">Panel pengelolaan toko</p></div><Link href="/" className="admin-top-link">Lihat toko ↗</Link></header><div className="admin-content">{children}</div></main>
  </div>;
}

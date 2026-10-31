import AdminShell from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/supabase/server";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Belum login akan diarahkan ke login. User non-admin dikembalikan ke toko.
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}

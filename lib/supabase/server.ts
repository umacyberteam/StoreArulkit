import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function createServerSupabase() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Konfigurasi Supabase belum lengkap.");

  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components tidak dapat menulis cookie; Route Handler tetap dapat melakukannya.
        }
      },
    },
  });
}

export async function requireAdmin() {
  const supabase = createServerSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { supabase, user: null, response: Response.json({ error: "Silakan login terlebih dahulu." }, { status: 401 }) };
  }

  const { data: profile, error } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (error || profile?.role !== "admin") {
    return { supabase, user: null, response: Response.json({ error: "Akses khusus admin." }, { status: 403 }) };
  }
  return { supabase, user, response: null };
}


/** Proteksi khusus halaman Server Component / layout admin. */
export async function requireAdminPage() {
  const supabase = createServerSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=/admin");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    redirect("/");
  }

  return { supabase, user };
}

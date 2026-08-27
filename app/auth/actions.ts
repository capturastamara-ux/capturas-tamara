"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";

export type SignInState = {
  ok: boolean;
  message: string;
} | null;

export async function signInAdmin(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Ingresa correo y contraseña." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { ok: false, message: "Credenciales incorrectas." };
    }

    if (!(await isAdmin())) {
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "Tu usuario no tiene rol admin en la tabla profiles.",
      };
    }
  } catch (error) {
    console.error("[auth] signInAdmin", error);
    return {
      ok: false,
      message: "No se pudo iniciar sesión. Intenta de nuevo.",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "" };
}

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

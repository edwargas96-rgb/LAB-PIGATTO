import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const criarAcessoSchema = z.object({
  email: z.string().trim().email().max(255),
  senha: z.string().min(8).max(72),
  nome_completo: z.string().trim().min(1).max(120),
  clinic_id: z.string().uuid(),
});

export const criarAcessoClinica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => criarAcessoSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: roles, error: rolesError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);

    if (rolesError) {
      console.error(rolesError);
      throw new Error("Não foi possível validar suas permissões.");
    }
    if (!(roles ?? []).some((r) => r.role === "laboratorio")) {
      throw new Error("Apenas o laboratório pode criar acessos.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: criado, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.senha,
      email_confirm: true,
      user_metadata: {
        nome_completo: data.nome_completo,
        clinic_id: data.clinic_id,
        role: "clinica",
      },
    });

    if (error || !criado.user) {
      console.error(error);
      throw new Error(error?.message ?? "Não foi possível criar o acesso.");
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: criado.user.id,
        nome_completo: data.nome_completo,
        clinic_id: data.clinic_id,
        email: data.email,
      },
      { onConflict: "id" },
    );
    if (profileError) console.error(profileError);

    return { ok: true, userId: criado.user.id };
  });

const recusarClinicaSchema = z.object({
  clinic_id: z.string().uuid(),
});

// Recusa um cadastro pendente (autoatendimento pelo /login): remove os
// acessos criados junto com o cadastro e a própria clínica.
export const recusarClinica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => recusarClinicaSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: roles, error: rolesError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);

    if (rolesError) {
      console.error(rolesError);
      throw new Error("Não foi possível validar suas permissões.");
    }
    if (!(roles ?? []).some((r) => r.role === "laboratorio")) {
      throw new Error("Apenas o laboratório pode recusar cadastros.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: vinculados } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("clinic_id", data.clinic_id);

    for (const perfil of vinculados ?? []) {
      await supabaseAdmin.auth.admin.deleteUser(perfil.id);
    }

    await supabaseAdmin.from("clinics").delete().eq("id", data.clinic_id);

    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const criarColaboradorSchema = z.object({
  email: z.string().trim().email().max(255),
  senha: z.string().min(8).max(72),
  nome_completo: z.string().trim().min(1).max(120),
});

// A própria clínica cadastra um dentista colaborador — mesmo processo que o
// laboratório usa para criar o acesso da clínica, só que aqui o clinic_id
// nunca vem do cliente: é sempre o da clínica de quem está logado.
export const criarColaboradorClinica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => criarColaboradorSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: perfil, error: perfilError } = await context.supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", context.userId)
      .maybeSingle();

    if (perfilError || !perfil?.clinic_id) {
      throw new Error("Apenas uma conta de clínica pode adicionar colaboradores.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: criado, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.senha,
      email_confirm: true,
      user_metadata: {
        nome_completo: data.nome_completo,
        clinic_id: perfil.clinic_id,
        role: "clinica",
      },
    });

    if (error || !criado.user) {
      throw new Error(error?.message ?? "Não foi possível criar o acesso.");
    }

    await supabaseAdmin.from("profiles").upsert(
      {
        id: criado.user.id,
        nome_completo: data.nome_completo,
        clinic_id: perfil.clinic_id,
        email: data.email,
      },
      { onConflict: "id" },
    );

    return { ok: true, userId: criado.user.id };
  });

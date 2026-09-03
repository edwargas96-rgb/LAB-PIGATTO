import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const cadastrarClinicaSchema = z.object({
  clinica: z.string().trim().min(1).max(120),
  responsavel: z.string().trim().min(1).max(120),
  telefone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(255),
  senha: z.string().min(8).max(72),
});

// Cadastro público (sem login): a própria clínica se cadastra pelo /login e
// fica pendente até o laboratório aprovar em /clinicas (clinics.ativo).
// Sem middleware de auth de propósito — quem chama ainda não tem sessão.
export const cadastrarClinicaPublico = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => cadastrarClinicaSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: clinica, error: clinicaError } = await supabaseAdmin
      .from("clinics")
      .insert({
        nome: data.clinica,
        responsavel: data.responsavel,
        telefone: data.telefone || null,
        email: data.email,
        ativo: false,
      })
      .select("id")
      .single();

    if (clinicaError || !clinica) {
      throw new Error("Não foi possível cadastrar a clínica.");
    }

    const { data: criado, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.senha,
      email_confirm: true,
      user_metadata: {
        nome_completo: data.responsavel,
        clinic_id: clinica.id,
        role: "clinica",
      },
    });

    if (userError || !criado.user) {
      // Sem usuário não tem como acessar a clínica criada — desfaz.
      await supabaseAdmin.from("clinics").delete().eq("id", clinica.id);
      throw new Error(
        userError?.message?.includes("already been registered")
          ? "Já existe uma conta com esse e-mail."
          : "Não foi possível criar o acesso.",
      );
    }

    await supabaseAdmin.from("profiles").upsert(
      {
        id: criado.user.id,
        nome_completo: data.responsavel,
        clinic_id: clinica.id,
        email: data.email,
      },
      { onConflict: "id" },
    );

    return { ok: true };
  });

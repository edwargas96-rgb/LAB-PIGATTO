import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// Confirma, via RLS (mesma regra de can_access_order), que o usuário logado
// pode enviar/baixar arquivos desta ordem — clínica dona da ordem ou laboratório.
async function verificarAcessoOrdem(supabase: SupabaseClient<Database>, orderId: string) {
  const { data, error } = await supabase.from("orders").select("id").eq("id", orderId).maybeSingle();
  if (error || !data) throw new Error("Você não tem acesso a esta ordem.");
}

const criarUploadSchema = z.object({
  orderId: z.string().uuid(),
  tipo: z.enum(["arquivo", "foto"]),
  nomeArquivo: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(255),
});

export const criarUploadWasabi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => criarUploadSchema.parse(data))
  .handler(async ({ data, context }) => {
    await verificarAcessoOrdem(context.supabase, data.orderId);

    const { getWasabiClient, getWasabiBucket } = await import("@/integrations/wasabi/client.server");
    const nomeSeguro = data.nomeArquivo.replace(/[^\w.\-]/g, "_");
    const path = `${data.orderId}/${data.tipo}s/${crypto.randomUUID()}-${nomeSeguro}`;

    const url = await getSignedUrl(
      getWasabiClient(),
      new PutObjectCommand({
        Bucket: getWasabiBucket(),
        Key: path,
        ContentType: data.contentType,
      }),
      { expiresIn: 300 },
    );

    return { url, path };
  });

const criarDownloadSchema = z.object({
  orderId: z.string().uuid(),
  path: z.string().trim().min(1).max(1024),
  nomeArquivo: z.string().trim().min(1).max(255),
});

export const criarDownloadWasabi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => criarDownloadSchema.parse(data))
  .handler(async ({ data, context }) => {
    await verificarAcessoOrdem(context.supabase, data.orderId);

    const { getWasabiClient, getWasabiBucket } = await import("@/integrations/wasabi/client.server");

    const url = await getSignedUrl(
      getWasabiClient(),
      new GetObjectCommand({
        Bucket: getWasabiBucket(),
        Key: data.path,
        ResponseContentDisposition: `attachment; filename="${data.nomeArquivo.replace(/"/g, "")}"`,
      }),
      { expiresIn: 60 },
    );

    return { url };
  });

// Peças compartilhadas entre as telas de gestão do laboratório
// (Ordens, Visão geral, etc.), expostas na barra lateral.
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { diasRestantes } from "@/lib/ordens";
import { LAB_STATUS_STYLE, type LabStatus } from "@/lib/gestao";

export type OS = {
  id: string;
  numero: string;
  paciente: string;
  dentista: string | null;
  item: string | null;
  elementos: number[];
  cor: string | null;
  data_entrega: string;
  observacoes: string | null;
  created_at: string;
  lab_status: LabStatus;
  urgencia: string | null;
  convenio: string | null;
  resposta_laboratorio: string | null;
  laboratorio_destino: string | null;
  entregue_em: string | null;
  clinic_id: string;
  deleted_at: string | null;
  clinics: { nome: string } | null;
};

const COLUNAS_OS =
  "id, numero, paciente, dentista, item, elementos, cor, data_entrega, observacoes, created_at, lab_status, urgencia, convenio, resposta_laboratorio, laboratorio_destino, entregue_em, clinic_id, deleted_at, clinics(nome)";

export function useOrdens() {
  return useQuery({
    queryKey: ["gestao-ordens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(COLUNAS_OS)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        throw error;
      }
      return (data ?? []) as unknown as OS[];
    },
  });
}

// Ordens enviadas para a lixeira pelo laboratório — somem das listas e da
// visão da clínica, mas ficam recuperáveis por 7 dias antes de serem
// apagadas de vez por um job agendado no banco.
export function useOrdensLixeira() {
  return useQuery({
    queryKey: ["gestao-ordens-lixeira"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(COLUNAS_OS)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });
      if (error) {
        console.error(error);
        throw error;
      }
      return (data ?? []) as unknown as OS[];
    },
  });
}

export async function enviarParaLixeira(ids: string[]) {
  const { error } = await supabase
    .from("orders")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids);
  if (error) {
    console.error(error);
    throw error;
  }
}

export async function restaurarDaLixeira(id: string) {
  const { error } = await supabase.from("orders").update({ deleted_at: null }).eq("id", id);
  if (error) {
    console.error(error);
    throw error;
  }
}

export function StatusSelo({
  status,
  entregueEm,
}: {
  status: LabStatus;
  // Quando a clínica confirma o recebimento, lab_status volta para
  // "Recebida" (mesmo valor da entrada da ordem). entregueEm (preenchido
  // na entrega e nunca mais limpo) distingue esse caso de uma ordem nova.
  entregueEm?: string | null;
}) {
  const confirmadaPelaClinica = status === "Recebida" && !!entregueEm;
  return (
    <span
      className={cn(
        "numeric inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        confirmadaPelaClinica
          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
          : LAB_STATUS_STYLE[status],
      )}
    >
      {confirmadaPelaClinica && <Check className="size-3" />}
      {confirmadaPelaClinica ? "Recebida (confirmada)" : status}
    </span>
  );
}

export function Kpi({ label, valor, hint }: { label: string; valor: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="numeric mt-2 text-2xl font-semibold">{valor}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function prazoChip(o: OS): { texto: string; cls: string } {
  if (o.lab_status === "Entregue") return { texto: "Entregue", cls: "text-muted-foreground" };
  const d = diasRestantes(o.data_entrega);
  if (d < 0) return { texto: `${Math.abs(d)}d atrasado`, cls: "text-danger font-semibold" };
  if (d === 0) return { texto: "HOJE", cls: "text-danger font-semibold" };
  if (d === 1) return { texto: "Amanhã", cls: "text-warning-foreground font-medium" };
  return { texto: `${d}d`, cls: "text-muted-foreground" };
}

export async function registrarEvento(orderId: string, status: string | null, comentario: string) {
  const { error } = await supabase.from("order_events").insert({
    order_id: orderId,
    status: status as never,
    comentario,
    autor: "Laboratório",
  });
  if (error) console.error(error);
}

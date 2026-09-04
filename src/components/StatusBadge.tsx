import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/ordens";

const cores: Record<string, string> = {
  Recebida: "bg-secondary text-secondary-foreground border-border",
  "Em análise": "bg-accent text-accent-foreground border-accent",
  "Em produção": "bg-primary/12 text-primary border-primary/30",
  "Em prova": "bg-warning/15 text-warning-foreground border-warning/40",
  Pronta: "bg-success/15 text-success border-success/40",
  "Enviada/Entregue": "bg-success text-success-foreground border-success",
};

export function StatusBadge({
  status,
  entregueEm,
  className,
}: {
  status: OrderStatus | string;
  // Quando a clínica confirma o recebimento do trabalho, o status volta
  // para "Recebida" (reaproveitando o mesmo valor da entrada da ordem).
  // entregueEm distingue esse caso — já passou por uma entrega — do de
  // uma ordem realmente nova, para não parecerem a mesma coisa no selo.
  entregueEm?: string | null;
  className?: string;
}) {
  const confirmadaPelaClinica = status === "Recebida" && !!entregueEm;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        confirmadaPelaClinica
          ? "bg-success/15 text-success border-success/40"
          : (cores[status] ?? "bg-secondary text-secondary-foreground border-border"),
        className,
      )}
    >
      {confirmadaPelaClinica ? (
        <Check className="size-3" />
      ) : (
        <span className="size-1.5 rounded-full bg-current opacity-70" />
      )}
      {confirmadaPelaClinica ? "Recebida (confirmada)" : status}
    </span>
  );
}

export function PrazoBadge({ tipo, texto }: { tipo: string; texto: string }) {
  const estilo =
    tipo === "atrasada"
      ? "bg-danger/12 text-danger border-danger/35"
      : tipo === "proxima"
        ? "bg-warning/18 text-warning-foreground border-warning/45"
        : tipo === "concluida"
          ? "bg-success/12 text-success border-success/35"
          : "bg-secondary text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "numeric inline-flex items-center rounded-md border px-2 py-0.5 text-xs",
        estilo,
      )}
    >
      {texto}
    </span>
  );
}

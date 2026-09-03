import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrdensLixeira, restaurarDaLixeira } from "@/components/gestao-shared";
import { formatarData } from "@/lib/ordens";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — LAB PIGATTO" },
      { name: "description", content: "Catálogos de itens, materiais, implantes e cores." },
      { property: "og:title", content: "Configurações — LAB PIGATTO" },
      { property: "og:description", content: "Gerencie os catálogos do laboratório." },
    ],
  }),
  component: Configuracoes,
});

type Tabela = "item_types" | "materials" | "implant_systems" | "scanbodies" | "tooth_shades";

const CATALOGOS: { tabela: Tabela; titulo: string; placeholder: string }[] = [
  { tabela: "item_types", titulo: "Tipos de trabalho", placeholder: "Ex.: Coroa unitária" },
  { tabela: "materials", titulo: "Materiais", placeholder: "Ex.: Zircônia translúcida" },
  { tabela: "implant_systems", titulo: "Sistemas de implante", placeholder: "Ex.: Neodent GM" },
  { tabela: "scanbodies", titulo: "Scanbodies", placeholder: "Ex.: Neodent GM Scanbody" },
  { tabela: "tooth_shades", titulo: "Cores (VITA)", placeholder: "Ex.: A2" },
];

function CatalogoCard({
  tabela,
  titulo,
  placeholder,
}: {
  tabela: Tabela;
  titulo: string;
  placeholder: string;
}) {
  const queryClient = useQueryClient();
  const [novo, setNovo] = useState("");

  const { data: itens = [] } = useQuery({
    queryKey: ["catalogo-admin", tabela],
    queryFn: async () => {
      const { data, error } = await supabase.from(tabela).select("id, nome, ativo").order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  const recarregar = () => {
    queryClient.invalidateQueries({ queryKey: ["catalogo-admin", tabela] });
    queryClient.invalidateQueries({ queryKey: ["catalogo", tabela] });
  };

  const adicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novo.trim()) return;
    const { error } = await supabase.from(tabela).insert({ nome: novo.trim() });
    if (error) {
      toast.error("Não foi possível adicionar o item.");
      return;
    }
    setNovo("");
    recarregar();
  };

  const alternar = async (id: string, ativo: boolean) => {
    const { error } = await supabase.from(tabela).update({ ativo: !ativo }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar o item.");
      return;
    }
    recarregar();
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {titulo}
      </h2>
      <form onSubmit={adicionar} className="mb-3 flex gap-2">
        <Input value={novo} onChange={(e) => setNovo(e.target.value)} placeholder={placeholder} />
        <Button type="submit" size="icon" aria-label={`Adicionar em ${titulo}`}>
          <Plus className="size-4" />
        </Button>
      </form>
      <ul className="space-y-1.5">
        {itens.map((i) => (
          <li
            key={i.id}
            className="flex items-center justify-between rounded-md bg-secondary px-3 py-1.5 text-sm"
          >
            <span className={i.ativo ? "" : "text-muted-foreground line-through"}>{i.nome}</span>
            <button
              type="button"
              aria-label={`${i.ativo ? "Desativar" : "Reativar"} ${i.nome}`}
              onClick={() => alternar(i.id, i.ativo)}
              className="text-muted-foreground hover:text-danger"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
        {itens.length === 0 && <li className="text-sm text-muted-foreground">Nenhum item.</li>}
      </ul>
    </section>
  );
}

function LixeiraCard() {
  const { data: ordens = [] } = useOrdensLixeira();
  const queryClient = useQueryClient();

  const restaurar = async (id: string, numero: string) => {
    try {
      await restaurarDaLixeira(id);
      toast.success(`O.S. ${numero} restaurada`);
      queryClient.invalidateQueries({ queryKey: ["gestao-ordens-lixeira"] });
      queryClient.invalidateQueries({ queryKey: ["gestao-ordens"] });
      queryClient.invalidateQueries({ queryKey: ["ordens"] });
    } catch {
      toast.error("Não foi possível restaurar a O.S.");
    }
  };

  const diasNaLixeira = (deletedAt: string) => {
    const dias = Math.floor((Date.now() - new Date(deletedAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - dias);
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
      <h2 className="mb-1 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Lixeira
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">
        O.S. enviadas para a lixeira são apagadas definitivamente após 7 dias.
      </p>
      {ordens.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma O.S. na lixeira.</p>
      ) : (
        <ul className="space-y-1.5">
          {ordens.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-md bg-secondary px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">
                <span className="numeric font-medium text-primary">{o.numero}</span> — {o.paciente}
                {o.clinics?.nome ? ` · ${o.clinics.nome}` : ""}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="numeric text-xs text-muted-foreground">
                  {o.deleted_at
                    ? `apaga em ${diasNaLixeira(o.deleted_at)}d (enviada em ${formatarData(o.deleted_at)})`
                    : ""}
                </span>
                <button
                  type="button"
                  aria-label={`Restaurar ${o.numero}`}
                  onClick={() => restaurar(o.id, o.numero)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <RotateCcw className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Configuracoes() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  return (
    <AppLayout titulo="Configurações" descricao="Catálogos usados no formulário de ordens">
      <div className="grid gap-5 lg:grid-cols-2">
        {CATALOGOS.map((c) => (
          <CatalogoCard key={c.tabela} {...c} />
        ))}
        <LixeiraCard />
      </div>
    </AppLayout>
  );
}

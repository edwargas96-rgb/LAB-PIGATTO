import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { criarDownloadWasabi } from "@/lib/arquivos.functions";
import { useAuth } from "@/lib/auth";
import type { Tables } from "@/integrations/supabase/types";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Odontograma } from "@/components/Odontograma";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LIST, formatarData, formatarDataHora, formatarTamanho } from "@/lib/ordens";
import { marcarOrdemVisitada } from "@/lib/mensagens";

export const Route = createFileRoute("/_app/ordens/$id")({
  head: () => ({
    meta: [
      { title: "Ordem de serviço — LAB PIGATTO" },
      { name: "description", content: "Detalhes e acompanhamento da ordem de serviço." },
      { property: "og:title", content: "Ordem de serviço — LAB PIGATTO" },
      { property: "og:description", content: "Detalhes e histórico da ordem no LAB PIGATTO." },
    ],
  }),
  component: DetalheOrdem,
});

function Campo({ rotulo, valor }: { rotulo: string; valor?: string | null | undefined }) {
  return (
    <div>
      <div className="text-xs tracking-wide text-muted-foreground uppercase">{rotulo}</div>
      <div className="mt-0.5 text-sm font-medium">{valor || "—"}</div>
    </div>
  );
}

function DetalheOrdem() {
  const { id } = Route.useParams();
  const { role, nomeCompleto, email, userId } = useAuth();
  const isLab = role === "laboratorio";
  const queryClient = useQueryClient();
  const [novoStatus, setNovoStatus] = useState("");
  const [comentario, setComentario] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagemClinica, setMensagemClinica] = useState("");
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  // Abrir a ordem já conta como "vista", para o selo de mensagem nova
  // sumir da lista.
  useEffect(() => {
    if (userId) marcarOrdemVisitada(userId, id);
  }, [userId, id]);

  const { data: ordem, isLoading } = useQuery({
    queryKey: ["ordem", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, clinics(nome, responsavel, telefone)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: arquivos = [] } = useQuery({
    queryKey: ["ordem-arquivos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_files")
        .select("*")
        .eq("order_id", id)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ["ordem-eventos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_events")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const baixar = async (arquivo: Tables<"order_files">) => {
    try {
      if (arquivo.storage_provider === "wasabi") {
        const { url } = await criarDownloadWasabi({
          data: { orderId: id, path: arquivo.storage_path, nomeArquivo: arquivo.nome_arquivo },
        });
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      const { data, error } = await supabase.storage
        .from("ordens")
        .createSignedUrl(arquivo.storage_path, 60, { download: arquivo.nome_arquivo });
      if (error || !data) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Não foi possível gerar o link do arquivo.");
    }
  };

  const atualizarStatus = async () => {
    if (!novoStatus) {
      toast.error("Selecione o novo status.");
      return;
    }
    setSalvando(true);
    const patch: Record<string, unknown> = { status: novoStatus };
    if (novoStatus === "Enviada/Entregue") patch["entregue_em"] = new Date().toISOString();
    const { error } = await supabase
      .from("orders")
      .update(patch as never)
      .eq("id", id);
    if (!error) {
      await supabase.from("order_events").insert({
        order_id: id,
        status: novoStatus as never,
        comentario: comentario.trim() || null,
        autor: nomeCompleto || email || "Laboratório",
      });
    }
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível atualizar o status.");
      return;
    }
    setComentario("");
    setNovoStatus("");
    toast.success("Status atualizado");
    queryClient.invalidateQueries({ queryKey: ["ordem", id] });
    queryClient.invalidateQueries({ queryKey: ["ordem-eventos", id] });
    queryClient.invalidateQueries({ queryKey: ["ordens"] });
  };

  const enviarMensagem = async () => {
    const texto = mensagemClinica.trim();
    if (!texto) return;
    setEnviandoMensagem(true);
    const { error } = await supabase.from("order_events").insert({
      order_id: id,
      status: null,
      comentario: texto,
      autor: nomeCompleto || email || "Clínica",
    });
    setEnviandoMensagem(false);
    if (error) {
      toast.error("Não foi possível enviar a mensagem.");
      return;
    }
    setMensagemClinica("");
    toast.success("Mensagem enviada ao laboratório");
    queryClient.invalidateQueries({ queryKey: ["ordem-eventos", id] });
  };

  // Dentista confirma o recebimento do trabalho entregue.
  const marcarRecebida = async () => {
    setSalvando(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: "Recebida" as never, lab_status: "Recebida" as never })
      .eq("id", id);
    if (!error) {
      await supabase.from("order_events").insert({
        order_id: id,
        status: "Recebida" as never,
        comentario: "Recebida pelo dentista",
        autor: nomeCompleto || email || "Clínica",
      });
    }
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível confirmar o recebimento.");
      return;
    }
    toast.success("Marcada como recebida");
    queryClient.invalidateQueries({ queryKey: ["ordem", id] });
    queryClient.invalidateQueries({ queryKey: ["ordem-eventos", id] });
    queryClient.invalidateQueries({ queryKey: ["ordens"] });
  };

  if (isLoading) {
    return (
      <AppLayout titulo="Ordem de serviço">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </AppLayout>
    );
  }

  if (!ordem) {
    return (
      <AppLayout titulo="Ordem não encontrada">
        <p className="text-sm text-muted-foreground">
          Esta ordem não existe ou você não tem acesso a ela.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard">Voltar ao painel</Link>
        </Button>
      </AppLayout>
    );
  }

  const clinica = (ordem as { clinics?: { nome?: string; responsavel?: string | null } | null })
    .clinics;
  const fotos = arquivos.filter((a) => a.tipo === "foto");
  const anexos = arquivos.filter((a) => a.tipo !== "foto");

  // O laboratório pode deixar um recado de duas formas: o campo dedicado
  // (resposta_laboratorio) ou um comentário ao trocar o status (order_events).
  // Unificamos aqui para a clínica sempre ver o mais recente num único lugar,
  // sem precisar saber por qual caminho o laboratório escreveu.
  const AUTO_COMENTARIOS_CLINICA = ["Ordem enviada pela clínica.", "Recebida pelo dentista"];
  const ultimoComentarioLab = eventos.find(
    (ev) => ev.comentario && ev.status !== null && !AUTO_COMENTARIOS_CLINICA.includes(ev.comentario),
  );
  const mensagemLaboratorio = ordem.resposta_laboratorio || ultimoComentarioLab?.comentario || null;
  // Mensagem mais recente enviada pela clínica pelo compositor (status nulo),
  // para o laboratório não precisar garimpar a Linha do tempo para achá-la.
  const mensagemDaClinica = eventos.find((ev) => ev.comentario && ev.status === null)?.comentario ?? null;

  return (
    <AppLayout
      titulo={`Ordem ${ordem.numero}`}
      descricao={`${ordem.paciente}${clinica?.nome ? ` · ${clinica.nome}` : ""}`}
      acao={<StatusBadge status={ordem.status} entregueEm={ordem.entregue_em} />}
    >
      <div className="mb-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Voltar
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Dados do trabalho
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Campo rotulo="Paciente" valor={ordem.paciente} />
              <Campo rotulo="Dentista" valor={ordem.dentista} />
              <Campo rotulo="Clínica" valor={clinica?.nome} />
              <Campo rotulo="Item" valor={ordem.item} />
              <Campo rotulo="Material" valor={ordem.material} />
              <Campo rotulo="Cor" valor={ordem.cor} />
              <Campo rotulo="Sob implante" valor={ordem.sob_implante ? "Sim" : "Não"} />
              {ordem.sob_implante && <Campo rotulo="Sistema" valor={ordem.implante} />}
              {ordem.sob_implante && <Campo rotulo="Scanbody" valor={ordem.scanbody} />}
              <Campo rotulo="Entrega" valor={formatarData(ordem.data_entrega)} />
              <Campo rotulo="Criada em" valor={formatarDataHora(ordem.created_at)} />
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
                Elementos
              </div>
              <Odontograma selecionados={(ordem.elementos as number[]) ?? []} somenteLeitura />
            </div>

            {ordem.observacoes && (
              <div className="mt-5">
                <div className="text-xs tracking-wide text-muted-foreground uppercase">
                  Observações
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap">{ordem.observacoes}</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Anexos
            </h2>
            {arquivos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum arquivo enviado.</p>
            ) : (
              <div className="space-y-4">
                {anexos.length > 0 && (
                  <ul className="space-y-2">
                    {anexos.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2"
                      >
                        <span className="flex min-w-0 items-center gap-2 text-sm">
                          <FileText className="size-4 shrink-0 text-primary" />
                          <span className="truncate">{a.nome_arquivo}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="numeric text-xs text-muted-foreground">
                            {formatarTamanho(a.tamanho ?? 0)}
                          </span>
                          <button
                            type="button"
                            aria-label={`Baixar ${a.nome_arquivo}`}
                            onClick={() => baixar(a)}
                          >
                            <Download className="size-4 text-muted-foreground hover:text-primary" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {fotos.length > 0 && (
                  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {fotos.map((f) => (
                      <li key={f.id}>
                        <button
                          type="button"
                          onClick={() => baixar(f)}
                          className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-border bg-secondary text-xs text-muted-foreground transition-colors hover:border-primary"
                        >
                          <Download className="size-4 text-primary" />
                          <span className="w-full truncate px-1">{f.nome_arquivo}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-5">
          {!isLab && ordem.status !== "Recebida" && (
            <section className="rounded-xl border border-primary/30 bg-primary-soft/40 p-5 shadow-[var(--shadow-card)]">
              <h2 className="mb-2 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Recebimento
              </h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Confirme quando receber o trabalho do laboratório.
              </p>
              <Button onClick={marcarRecebida} disabled={salvando} className="w-full">
                {salvando ? "Salvando…" : "Marcar como recebida"}
              </Button>
            </section>
          )}

          {(mensagemLaboratorio || !isLab) && (
            <section className="rounded-xl border border-primary/30 bg-primary-soft/40 p-5 shadow-[var(--shadow-card)]">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                <MessageSquare className="size-4" /> Mensagem do laboratório
              </h2>
              {mensagemLaboratorio ? (
                <p className="text-sm whitespace-pre-wrap">{mensagemLaboratorio}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  O laboratório ainda não enviou nenhuma mensagem.
                </p>
              )}

              {!isLab && (
                <div className="mt-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="mensagem-clinica">
                      {mensagemLaboratorio ? "Responder" : "Enviar mensagem"}
                    </Label>
                    <Textarea
                      id="mensagem-clinica"
                      rows={3}
                      maxLength={500}
                      value={mensagemClinica}
                      onChange={(e) => setMensagemClinica(e.target.value)}
                      placeholder="Escreva para o laboratório…"
                    />
                  </div>
                  <Button
                    onClick={enviarMensagem}
                    disabled={enviandoMensagem || !mensagemClinica.trim()}
                    size="sm"
                    className="w-full"
                  >
                    {enviandoMensagem ? "Enviando…" : "Enviar"}
                  </Button>
                </div>
              )}
            </section>
          )}

          {isLab && mensagemDaClinica && (
            <section className="rounded-xl border border-primary/30 bg-primary-soft/40 p-5 shadow-[var(--shadow-card)]">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                <MessageSquare className="size-4" /> Mensagem da clínica
              </h2>
              <p className="text-sm whitespace-pre-wrap">{mensagemDaClinica}</p>
            </section>
          )}

          {isLab && (
            <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="mb-4 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Atualizar status
              </h2>
              <div className="space-y-3">
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Novo status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_LIST.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1.5">
                  <Label htmlFor="comentario">Comentário</Label>
                  <Textarea
                    id="comentario"
                    rows={3}
                    maxLength={500}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
                <Button onClick={atualizarStatus} disabled={salvando} className="w-full">
                  {salvando ? "Salvando…" : "Salvar atualização"}
                </Button>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Linha do tempo
            </h2>
            {eventos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem movimentações.</p>
            ) : (
              <ol className="relative space-y-5 border-l border-border pl-5">
                {eventos.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span className="absolute top-1.5 -left-[1.4rem] size-2.5 rounded-full bg-primary ring-4 ring-card" />
                    <div className="text-sm font-medium">{ev.status ?? "Mensagem"}</div>
                    <div className="numeric text-xs text-muted-foreground">
                      {formatarDataHora(ev.created_at)}
                    </div>
                    {ev.comentario && <p className="mt-1 text-sm">{ev.comentario}</p>}
                    {ev.autor && (
                      <p className="text-xs text-muted-foreground">por {ev.autor}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

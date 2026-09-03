import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, UserCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { criarColaboradorClinica } from "@/lib/perfil.functions";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — LAB PIGATTO" },
      { name: "description", content: "Dados da conta e segurança." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { userId, email, role, clinicId, clinicNome, nomeCompleto } = useAuth();

  return (
    <AppLayout titulo="Meu perfil" descricao="Dados da conta e segurança">
      <div className="max-w-xl space-y-5">
        <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            <UserCircle className="size-4" /> Dados da conta
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-medium">{nomeCompleto || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">E-mail</dt>
              <dd className="font-medium">{email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                {role === "laboratorio" ? "Perfil" : "Vinculado a"}
              </dt>
              <dd className="font-medium">
                {role === "laboratorio" ? "Laboratório" : clinicNome || "Clínica"}
              </dd>
            </div>
          </dl>
        </section>

        <AlterarSenhaCard email={email} />

        {role === "clinica" && clinicId && userId && (
          <ColaboradoresCard clinicId={clinicId} userId={userId} />
        )}
      </div>
    </AppLayout>
  );
}

// ------------------------------------------------------------ Alterar senha
function AlterarSenhaCard({ email }: { email: string | null }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  const alterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      toast.error("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não são iguais.");
      return;
    }
    if (!email) return;

    setSalvando(true);
    // Confirma a senha atual antes de trocar, por segurança.
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: senhaAtual,
    });
    if (loginError) {
      setSalvando(false);
      toast.error("Senha atual incorreta.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível trocar a senha.", { description: error.message });
      return;
    }
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    toast.success("Senha atualizada");
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Alterar senha
      </h2>
      <form onSubmit={alterarSenha} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="senha-atual">Senha atual</Label>
          <Input
            id="senha-atual"
            type="password"
            required
            autoComplete="current-password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nova-senha">Nova senha</Label>
            <Input
              id="nova-senha"
              type="password"
              required
              autoComplete="new-password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
            <Input
              id="confirmar-senha"
              type="password"
              required
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={salvando}>
          {salvando && <Loader2 className="size-4 animate-spin" />} Salvar nova senha
        </Button>
      </form>
    </section>
  );
}

// ------------------------------------------------------------ Colaboradores
function ColaboradoresCard({ clinicId, userId }: { clinicId: string; userId: string }) {
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [senha, setSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  const { data: colaboradores = [], isLoading } = useQuery({
    queryKey: ["colaboradores-clinica", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome_completo, email")
        .eq("clinic_id", clinicId)
        .order("nome_completo");
      if (error) throw error;
      return data ?? [];
    },
  });

  const adicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await criarColaboradorClinica({
        data: { email: emailNovo.trim(), senha, nome_completo: nome.trim() },
      });
      toast.success("Colaborador adicionado", {
        description: `${emailNovo.trim()} já pode entrar no portal.`,
      });
      setNome("");
      setEmailNovo("");
      setSenha("");
      setAberto(false);
      queryClient.invalidateQueries({ queryKey: ["colaboradores-clinica", clinicId] });
    } catch (err) {
      toast.error("Não foi possível adicionar o colaborador", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          <Users className="size-4" /> Colaboradores
        </h2>
        <Button size="sm" onClick={() => setAberto(true)}>
          <Plus className="size-4" /> Adicionar dentista
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : colaboradores.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum colaborador ainda.</p>
      ) : (
        <ul className="space-y-1.5">
          {colaboradores.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate font-medium">
                {c.nome_completo}
                {c.id === userId && <span className="text-muted-foreground"> (você)</span>}
              </span>
              <span className="truncate text-xs text-muted-foreground">{c.email}</span>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar dentista</DialogTitle>
            <DialogDescription>
              Cria um acesso de dentista dentro da sua clínica, com e-mail e senha próprios.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={adicionar} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome-colab">Nome completo *</Label>
              <Input
                id="nome-colab"
                required
                maxLength={120}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-colab">E-mail *</Label>
              <Input
                id="email-colab"
                type="email"
                required
                maxLength={255}
                value={emailNovo}
                onChange={(e) => setEmailNovo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha-colab">Senha provisória *</Label>
              <Input
                id="senha-colab"
                type="text"
                required
                minLength={8}
                maxLength={72}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={salvando}>
                {salvando ? "Criando…" : "Criar acesso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Redefinir senha — LAB PIGATTO" }],
  }),
  component: RedefinirSenha,
});

type Estado = "verificando" | "pronto" | "invalido" | "sucesso";

function RedefinirSenha() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // O link do e-mail traz um token de recuperação na URL. O client do
    // Supabase detecta isso sozinho e cria uma sessão temporária, avisando
    // pelo evento PASSWORD_RECOVERY. Se a pessoa já chegar com essa sessão
    // pronta (evento disparou antes do listener montar), a sessão existente
    // também é aceita.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setEstado("pronto");
    });

    const tempoLimite = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setEstado((atual) => (atual === "verificando" ? (data.session ? "pronto" : "invalido") : atual));
    }, 1500);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(tempoLimite);
    };
  }, []);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      toast.error("As senhas não são iguais.");
      return;
    }
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar a nova senha", { description: error.message });
      return;
    }
    setEstado("sucesso");
    toast.success("Senha atualizada");
    setTimeout(() => navigate({ to: "/dashboard", replace: true }), 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <img src="https://i.imgur.com/i8WDIdd.png" alt="LAB PIGATTO" className="h-32 w-auto" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 28px 11px var(--background)" }}
            />
          </div>
        </div>

        {estado === "verificando" && (
          <p className="text-center text-sm text-muted-foreground">Verificando o link…</p>
        )}

        {estado === "invalido" && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-5 text-center">
            <h1 className="text-lg font-semibold">Link inválido ou expirado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Esse link de redefinição não é mais válido. Solicite um novo.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/recuperar-senha">Solicitar novo link</Link>
            </Button>
          </div>
        )}

        {estado === "sucesso" && (
          <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-5 text-center">
            <h1 className="text-lg font-semibold">Senha atualizada!</h1>
            <p className="mt-2 text-sm text-muted-foreground">Te levando para o painel…</p>
          </div>
        )}

        {estado === "pronto" && (
          <>
            <h1 className="text-center text-2xl font-semibold">Criar nova senha</h1>
            <p className="mx-auto mt-2 max-w-[19rem] text-center text-sm text-muted-foreground">
              Escolha uma nova senha para acessar o LAB PIGATTO.
            </p>

            <form onSubmit={salvar} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="senha">Nova senha</Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmar">Confirmar nova senha</Label>
                <Input
                  id="confirmar"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar nova senha"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

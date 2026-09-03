import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AreaLogada,
});

function AreaLogada() {
  const { loading, session, role, clinicAtiva, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login", replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="numeric text-sm text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  // Clínica cadastrada por conta própria (via /login) fica pendente até o
  // laboratório aprovar em /clinicas — sem acesso ao resto do sistema.
  if (role === "clinica" && clinicAtiva === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary-soft/50 text-primary">
            <Clock className="size-6" />
          </div>
          <h1 className="text-lg font-semibold">Cadastro em análise</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu cadastro foi recebido e está aguardando a aprovação do laboratório. Assim que for
            liberado, você já pode entrar normalmente.
          </p>
          <button onClick={() => signOut()} className="mt-5 text-sm text-primary hover:underline">
            Sair
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

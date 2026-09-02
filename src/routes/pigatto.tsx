import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/pigatto")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso do laboratório — LAB PIGATTO" },
      {
        name: "description",
        content: "Área restrita da equipe do laboratório LAB PIGATTO.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Acesso do laboratório — LAB PIGATTO" },
      { property: "og:description", content: "Área restrita do LAB PIGATTO." },
    ],
  }),
  component: LoginPigatto,
});

function LoginPigatto() {
  const navigate = useNavigate();
  const { session, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Se já estiver autenticado como laboratório, segue direto para o painel.
  useEffect(() => {
    if (!loading && session && role === "laboratorio") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, session, role, navigate]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error || !data.user) {
      setEnviando(false);
      toast.error("Não foi possível entrar", { description: "Verifique o e-mail e a senha." });
      return;
    }

    // Confirma que a conta pertence à equipe do laboratório.
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isLab = (roles ?? []).some((r) => r.role === "laboratorio");

    if (!isLab) {
      await supabase.auth.signOut();
      setEnviando(false);
      toast.error("Acesso restrito", {
        description: "Esta área é exclusiva da equipe do laboratório.",
      });
      return;
    }

    setEnviando(false);
    toast.success("Bem-vindo(a) à área do laboratório");
    navigate({ to: "/dashboard", replace: true });
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/5541991071492", "_blank");
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-sidebar lg:flex lg:flex-col">
        <img
          src="/login-lab.jpg"
          alt="LAB PIGATTO — Central de produção do laboratório"
          className="absolute inset-0 h-full w-full object-cover object-left"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div>
            <div className="flex items-center gap-3">
              <img src="https://i.imgur.com/i8WDIdd.png" alt="PIGATTO" className="h-12 w-auto" />
              <div>
                <div className="font-semibold text-white text-sm">PIGATTO</div>
                <div className="text-xs text-white/70">prótese odontológica</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Central de produção do laboratório
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-8">
              Gerencie os processos de fabricação com precisão. Acesso exclusivo para a equipe interna.
            </p>
            <div className="w-16 h-1 bg-primary rounded-full mb-12"></div>

            <div className="flex gap-2 text-xs text-white/60 flex-wrap">
              <span>Recebido</span>
              <span>—</span>
              <span>Em análise</span>
              <span>—</span>
              <span>Em produção</span>
              <span>—</span>
              <span>Em prova</span>
              <span>—</span>
              <span>Pronta</span>
              <span>—</span>
              <span>Entrega</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6 bg-gradient-to-l from-background to-background/80 lg:bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src="https://i.imgur.com/i8WDIdd.png" alt="PIGATTO" className="h-8 w-auto" />
            <div>
              <div className="font-semibold text-sm">PIGATTO</div>
              <div className="text-xs text-muted-foreground">prótese odontológica</div>
            </div>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft/50 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="size-3.5" /> Acesso restrito
          </div>

          <h1 className="text-2xl font-semibold">Entrar no laboratório</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Área exclusiva da equipe interna do LAB PIGATTO.
          </p>

          <form onSubmit={entrar} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="equipe@labpigatto.com.br"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <p className="text-center text-xs text-muted-foreground">
              É de uma clínica parceira?{" "}
              <a href="/login" className="text-primary hover:underline">
                Acesse por aqui
              </a>
              .
            </p>

            <button
              type="button"
              onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371 0-.57 0-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.887 1.235c-1.516.791-2.911 1.963-3.965 3.428C3.02 10.465 2.5 12.16 2.5 13.9c0 1.933.48 3.797 1.388 5.471l-1.479 5.402 5.517-1.45c1.602.887 3.447 1.355 5.375 1.355 6.165 0 11.172-5.027 11.172-11.201 0-2.99-1.193-5.81-3.356-7.93-2.162-2.121-5.053-3.329-8.107-3.329z"/>
              </svg>
              Fale conosco pelo WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

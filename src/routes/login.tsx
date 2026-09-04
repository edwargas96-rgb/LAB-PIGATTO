import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cadastrarClinicaPublico } from "@/lib/cadastro.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMERO = "5541991071492";

// Mensagem já preenchida na conversa, para a pessoa só apertar enviar.
const WHATSAPP_MENSAGEM =
  "Olá! Gostaria de solicitar meu acesso ao portal do LAB PIGATTO " +
  "para enviar meus trabalhos digitais.";

const WHATSAPP = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAGEM)}`;

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — LAB PIGATTO" },
      {
        name: "description",
        content: "Acesso das clínicas e dentistas parceiros do LAB PIGATTO.",
      },
      { property: "og:title", content: "Entrar — LAB PIGATTO" },
      { property: "og:description", content: "Portal de ordens de serviço do LAB PIGATTO." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const loginRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [passouDaAbertura, setPassouDaAbertura] = useState(false);

  const irParaLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const irParaTopo = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // No celular, a seta vira "voltar ao topo" assim que a tela de abertura
  // sai de vista, para não ficar presa lá embaixo depois que a pessoa rola.
  useEffect(() => {
    const onScroll = () => {
      const alturaAbertura = heroRef.current?.offsetHeight ?? 0;
      setPassouDaAbertura(window.scrollY > alturaAbertura - 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setEnviando(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: "Verifique o e-mail e a senha." });
      return;
    }
    toast.success("Bem-vindo(a) ao LAB PIGATTO");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="bg-background">
      {/* Tela de abertura só no celular: a mesma arte em tela cheia, com um
          degradê esmaecendo para a cor da página lá embaixo e uma seta que
          rola suavemente até o formulário de login. */}
      <div
        ref={heroRef}
        className="relative flex h-[100svh] flex-col justify-end overflow-hidden bg-background p-6 pt-10 pb-6 lg:hidden"
      >
        <img
          src="/login-art.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
          style={{
            maskImage:
              "linear-gradient(to bottom, #000 0%, #000 62%, rgba(0,0,0,0.35) 82%, rgba(0,0,0,0) 96%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 62%, rgba(0,0,0,0.35) 82%, rgba(0,0,0,0) 96%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(8,32,54,0.55) 0%, rgba(8,32,54,0.4) 30%, rgba(8,32,54,0.78) 62%, rgba(8,32,54,0.6) 82%, rgba(8,32,54,0) 100%)",
          }}
        />

        <div className="relative flex w-full min-w-0 flex-col items-center gap-4">
          {/* Desce até o login; gira 180° para apontar pra cima assim que a
              abertura sai de vista, servindo de atalho pra voltar ao topo. */}
          <button
            type="button"
            onClick={passouDaAbertura ? irParaTopo : irParaLogin}
            aria-label={passouDaAbertura ? "Voltar ao topo" : "Ir para o login"}
            className={[
              "flex size-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25",
              "transition-transform duration-300 ease-out hover:bg-white/20",
              passouDaAbertura ? "rotate-180" : "animate-bounce",
            ].join(" ")}
          >
            <ChevronDown className="size-5 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-rows-[1fr] lg:min-h-screen lg:grid-cols-2">
      {/* Painel da esquerda: arte + texto. A arte dissolve na cor da página
          à direita (máscara), para não haver corte seco entre as metades. */}
      <div className="relative hidden h-full overflow-hidden lg:block">
        <img
          src="/login-art.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-left"
          style={{
            maskImage: "linear-gradient(to right, #000 0%, #000 84%, rgba(0,0,0,0.55) 93%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to right, #000 0%, #000 84%, rgba(0,0,0,0.55) 93%, rgba(0,0,0,0) 100%)",
          }}
        />
        {/* Véu escuro só do lado do texto, para garantir contraste. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(8,32,54,0.70) 0%, rgba(8,32,54,0.26) 42%, rgba(8,32,54,0) 70%)",
          }}
        />

      </div>

      {/* Painel da direita: logo em destaque + formulário. */}
      <div ref={loginRef} className="flex items-center justify-center overflow-y-auto px-6 py-8 lg:min-h-screen">
        <div className="w-full max-w-sm">
          <div className="mb-3 flex justify-center">
            {/* O arquivo da logo tem uma placa de fundo. O véu com sombra
                interna na cor da página esfuma as bordas do retângulo, para
                a logo não aparecer como um quadrado colado na tela. */}
            <div className="relative">
              <img src="https://i.imgur.com/EjkPuVQ.png" alt="LAB PIGATTO" className="h-44 w-auto" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: "inset 0 0 28px 11px var(--background)" }}
              />
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[15rem] rounded-lg bg-secondary p-1 text-sm">
            <button
              type="button"
              onClick={() => setModo("entrar")}
              className={cn(
                "flex-1 rounded-md py-1.5 font-medium transition-colors",
                modo === "entrar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setModo("cadastrar")}
              className={cn(
                "flex-1 rounded-md py-1.5 font-medium transition-colors",
                modo === "cadastrar"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              Cadastrar clínica
            </button>
          </div>

          {modo === "entrar" ? (
            <>
              <p className="mx-auto mt-4 max-w-[19rem] text-center text-sm text-muted-foreground">
                Acesso das clínicas e dentistas parceiros. Use o e-mail e a senha do seu cadastro.
              </p>

              <form onSubmit={entrar} className="mt-5 space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="clinica@exemplo.com.br"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="senha">Senha</Label>
                    <Link to="/recuperar-senha" className="text-xs text-primary hover:underline">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={mostrarSenha ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha((v) => !v)}
                      aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={enviando}>
                  {enviando ? "Entrando…" : "Entrar"}
                </Button>
              </form>
            </>
          ) : (
            <CadastroClinicaForm onCadastrado={() => setModo("entrar")} />
          )}

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-center text-xs text-muted-foreground">
              Já tem cadastro e não consegue acessar? Fale conosco.
            </p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] text-sm font-medium text-white transition-colors hover:bg-[#1EBE5A] focus-visible:ring-2 focus-visible:ring-[#25D366]/40 focus-visible:outline-none"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
              </svg>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Cadastro de clínica
function CadastroClinicaForm({ onCadastrado }: { onCadastrado: () => void }) {
  const [clinica, setClinica] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const cadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      await cadastrarClinicaPublico({
        data: {
          clinica: clinica.trim(),
          responsavel: responsavel.trim(),
          telefone: telefone.trim() || undefined,
          email: email.trim(),
          senha,
        },
      });
      setEnviado(true);
    } catch (err) {
      toast.error("Não foi possível cadastrar", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="mt-5 rounded-xl border border-primary/30 bg-primary-soft/40 p-5 text-center">
        <h2 className="text-base font-semibold">Cadastro enviado!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Assim que o laboratório aprovar, você já pode entrar com o e-mail e a senha que
          cadastrou.
        </p>
        <Button variant="outline" className="mt-4" onClick={onCadastrado}>
          Voltar para o login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={cadastrar} className="mt-5 space-y-3.5">
      <div className="space-y-1.5">
        <Label htmlFor="clinica">Nome da clínica *</Label>
        <Input
          id="clinica"
          required
          maxLength={120}
          value={clinica}
          onChange={(e) => setClinica(e.target.value)}
          placeholder="Clínica Sorriso"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="responsavel">Seu nome *</Label>
        <Input
          id="responsavel"
          required
          maxLength={120}
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="telefone-cadastro">Telefone</Label>
        <Input
          id="telefone-cadastro"
          maxLength={30}
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(00) 00000-0000"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email-cadastro">E-mail *</Label>
        <Input
          id="email-cadastro"
          type="email"
          required
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="clinica@exemplo.com.br"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="senha-cadastro">Senha *</Label>
        <div className="relative">
          <Input
            id="senha-cadastro"
            type={mostrarSenha ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo de 8 caracteres"
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? "Enviando…" : "Cadastrar clínica"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Seu acesso fica pendente até o laboratório aprovar o cadastro.
      </p>
    </form>
  );
}

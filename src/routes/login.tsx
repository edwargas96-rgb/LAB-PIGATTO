import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, Clock, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WHATSAPP_NUMERO = "5541991071492";

// Mensagem já preenchida na conversa, para a pessoa só apertar enviar.
const WHATSAPP_MENSAGEM =
  "Olá! Gostaria de solicitar meu acesso ao portal do LAB PIGATTO " +
  "para enviar meus trabalhos digitais.";

const WHATSAPP = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAGEM)}`;

const ETAPAS = ["Recebida", "Em análise", "Em produção", "Em prova", "Pronta", "Entregue"];

const DESTAQUES = [
  { icone: Upload, texto: "Envie arquivos e fotos do caso" },
  { icone: Camera, texto: "Marque os elementos no odontograma" },
  { icone: Clock, texto: "Acompanhe cada etapa em tempo real" },
];

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
  const [enviando, setEnviando] = useState(false);

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
    <div className="grid min-h-screen grid-rows-[1fr] bg-background lg:grid-cols-2">
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

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-14">
          <span className="text-[11px] font-medium tracking-[0.22em] text-white/55 uppercase">
            Portal do dentista
          </span>

          <div className="max-w-[24rem] xl:max-w-[26rem]">
            <h2 className="font-display text-[2rem] leading-[1.15] font-bold text-white xl:text-[2.3rem]">
              Ordens de serviço com precisão clínica, do consultório à bancada.
            </h2>

            <div className="mt-8 h-px w-14 bg-white/25" />

            <ul className="mt-8 space-y-3.5">
              {DESTAQUES.map(({ icone: Icone, texto }) => (
                <li key={texto} className="flex items-center gap-3.5 text-sm text-white/75">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <Icone className="size-4 text-white/90" />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-x-2 text-[10px] tracking-wide text-white/45">
            {ETAPAS.map((etapa, i) => (
              <span key={etapa} className="flex items-center gap-2 whitespace-nowrap">
                {i > 0 && <span aria-hidden="true">→</span>}
                {etapa}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Painel da direita: logo em destaque + formulário. */}
      <div className="flex items-center justify-center overflow-y-auto px-6 py-12">
        <div className="w-full max-w-sm lg:mt-6">
          <div className="mb-8 flex justify-center">
            {/* O arquivo da logo tem uma placa de fundo. O véu com sombra
                interna na cor da página esfuma as bordas do retângulo, para
                a logo não aparecer como um quadrado colado na tela. */}
            <div className="relative">
              <img src="https://i.imgur.com/i8WDIdd.png" alt="LAB PIGATTO" className="h-40 w-auto" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: "inset 0 0 28px 11px var(--background)" }}
              />
            </div>
          </div>

          <h1 className="text-center text-2xl font-semibold">Entrar</h1>
          <p className="mx-auto mt-2 max-w-[19rem] text-center text-sm text-muted-foreground">
            Acesso das clínicas e dentistas parceiros. Use o e-mail e a senha do seu cadastro.
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
                placeholder="clinica@exemplo.com.br"
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

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-center text-xs text-muted-foreground">
              Ainda não tem acesso? Fale com a gente e solicite o cadastro da sua clínica.
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
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/recuperar-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Recuperar senha — LAB PIGATTO" },
      {
        name: "description",
        content: "Solicite um link para redefinir a senha de acesso ao LAB PIGATTO.",
      },
    ],
  }),
  component: RecuperarSenha,
});

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setEnviando(false);
    // Sempre mostra a mesma mensagem, exista ou não o e-mail — evita
    // revelar quais e-mails têm cadastro no sistema.
    setEnviado(true);
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

        {enviado ? (
          <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-5 text-center">
            <h1 className="text-lg font-semibold">Verifique seu e-mail</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Se <span className="font-medium text-foreground">{email}</span> estiver cadastrado,
              você vai receber um link para redefinir sua senha em instantes.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-center text-2xl font-semibold">Recuperar senha</h1>
            <p className="mx-auto mt-2 max-w-[19rem] text-center text-sm text-muted-foreground">
              Digite o e-mail do seu cadastro. Vamos te mandar um link para criar uma senha nova.
            </p>

            <form onSubmit={enviar} className="mt-8 space-y-4">
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
              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? "Enviando…" : "Enviar link de redefinição"}
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}

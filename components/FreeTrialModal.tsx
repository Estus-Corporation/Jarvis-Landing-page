"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ArrowClockwise,
  CircleNotch,
  Copy,
  Check,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type Step = "email" | "code" | "done";

interface ConfirmResult {
  token: string;
  balanceMicro: number;
  downloadUrl: string;
}

// Formulario de teste gratis (US$0,50 de credito, sem chave propria de
// OpenAI/ElevenLabs) — chama o Jarvis Credits Server via as duas rotas proxy
// em app/api/free-trial/*. Verificacao de e-mail em dois passos (pedir codigo
// / confirmar) evita farming de credito com e-mail falso, ver
// Jarvis-Credits-Server/CLAUDE.md.
export default function FreeTrialModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<ConfirmResult | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Reseta o formulario toda vez que o modal fecha, pra nao reabrir no meio
  // de um fluxo antigo (ex.: e-mail de uma sessao anterior ainda preenchido).
  React.useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setStep("email");
      setEmail("");
      setCode("");
      setError("");
      setResult(null);
      setCopied(false);
    }, 300);
    return () => clearTimeout(t);
  }, [open]);

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/free-trial/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Não foi possível enviar o código.");
        return;
      }
      setStep("code");
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/free-trial/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Código incorreto.");
        return;
      }
      setResult(data as ConfirmResult);
      setStep("done");
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  function copyToken() {
    if (!result) return;
    navigator.clipboard.writeText(result.token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-7"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={16} weight="bold" />
            </button>

            {step === "email" && (
              <form onSubmit={requestCode}>
                <h3 className="text-lg font-semibold text-[#FAFAFA]">Teste grátis</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                  Sem cartão, sem criar conta na OpenAI/ElevenLabs. Só o seu e-mail — a
                  gente manda um código de 6 dígitos pra confirmar.
                </p>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-5 w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
                />
                {error && <p className="mt-2.5 text-xs text-red-300/85">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#FAFAFA] px-6 py-3 text-sm font-semibold text-ink-950 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading && <CircleNotch size={15} className="animate-spin" />}
                  {loading ? "Enviando…" : "Enviar código"}
                </button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={confirmCode}>
                <h3 className="text-lg font-semibold text-[#FAFAFA]">Confirme seu e-mail</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                  Enviamos um código pra <span className="text-white/80">{email}</span>.
                  Vale por 10 minutos.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="mt-5 w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-3 text-center font-mono text-xl tracking-[0.3em] text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                />
                {error && <p className="mt-2.5 text-xs text-red-300/85">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#FAFAFA] px-6 py-3 text-sm font-semibold text-ink-950 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading && <CircleNotch size={15} className="animate-spin" />}
                  {loading ? "Confirmando…" : "Confirmar"}
                </button>
                <button
                  type="button"
                  onClick={() => requestCode()}
                  disabled={loading}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70 disabled:pointer-events-none"
                >
                  <ArrowClockwise size={12} />
                  Reenviar código
                </button>
              </form>
            )}

            {step === "done" && result && (
              <div>
                <CheckCircle size={28} weight="light" className="text-white/80" />
                <h3 className="mt-3 text-lg font-semibold text-[#FAFAFA]">Tudo pronto</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                  Copie o código abaixo e cole na primeira tela do app, no campo
                  &ldquo;Já assina o Jarvis? Cole seu código de acesso&rdquo;.
                </p>

                <p className="mb-1.5 mt-5 text-xs uppercase tracking-[0.1em] text-white/40">
                  Seu código de acesso
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 truncate rounded-xl border border-white/10 bg-ink-950 px-4 py-3 font-mono text-xs text-white/85">
                    {result.token}
                  </div>
                  <button
                    type="button"
                    onClick={copyToken}
                    aria-label="Copiar código"
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                      copied
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                    )}
                  >
                    {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
                  </button>
                </div>

                <a
                  href={result.downloadUrl}
                  className="mt-4 block w-full rounded-full bg-[#FAFAFA] px-6 py-3 text-center text-sm font-semibold text-ink-950 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white"
                >
                  Baixar o Jarvis para Windows
                </a>
                <p className="mt-3 text-center text-xs text-white/40">
                  US$0,50 de crédito grátis. Depois disso, é só assinar um plano.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

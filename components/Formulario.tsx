"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  WarningCircle,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { useReducedMotionSafe } from "@/components/ui/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import SectionEyebrow from "@/components/ui/section-eyebrow";

const EASE = [0.16, 1, 0.3, 1] as const;

// Convite da Comunidade do WhatsApp, mostrado na tela de sucesso.
//
// TROQUE ANTES DE DIVULGAR: crie a Comunidade no WhatsApp Business, copie o
// link de convite e cole aqui (ou defina NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL no
// ambiente). Enquanto estiver vazio, a tela de sucesso continua funcionando: em
// vez do botao, ela promete o convite por mensagem — nao inventa um link que
// leva a lugar nenhum.
//
// Comunidade, nao grupo comum: grupo tem teto de 1024 membros, vira ruido bem
// antes disso e o link de convite pode ser resetado (quebrando divulgacao ja
// feita). Comunidade tem canal de Avisos, onde so admin posta — que e
// exatamente o formato de "te aviso quando lancar".
const WHATSAPP_COMMUNITY_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL ?? "";

type FieldName = "nome" | "whatsapp" | "email";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const EMPTY: Values = { nome: "", whatsapp: "", email: "" };

// Mascara de celular brasileiro aplicada enquanto digita. Formatar durante a
// digitacao ajuda (a pessoa ve que o campo espera DDD); MOSTRAR ERRO durante a
// digitacao atrapalha — por isso validacao so roda no blur/submit, mais abaixo.
function maskPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  // 9 digitos = celular (5+4); 8 = fixo (4+4).
  const split = rest.length > 8 ? 5 : 4;
  if (rest.length <= split) return `(${ddd}) ${rest}`;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

// Validacao proposital de baixo rigor: o objetivo e pegar erro de digitacao, nao
// bancar autoridade sobre o que e um endereco valido. Regra apertada demais
// rejeita gente real e some com o lead — o custo de um dado torto na planilha e
// muito menor que o de uma pessoa interessada barrada na porta.
function validate(values: Values): Errors {
  const errors: Errors = {};

  if (values.nome.trim().length < 2) {
    errors.nome = "Digite seu nome.";
  }

  const digits = values.whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) {
    errors.whatsapp = "Digite o DDD e o número. Ex: (11) 91234-5678";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Digite um e-mail válido.";
  }

  return errors;
}

const FIELDS: {
  name: FieldName;
  label: string;
  placeholder: string;
  type: string;
  autoComplete: string;
  inputMode?: "text" | "tel" | "email";
}[] = [
  {
    name: "nome",
    label: "Nome",
    placeholder: "Como podemos te chamar",
    type: "text",
    autoComplete: "name",
  },
  {
    // Rotulado "WhatsApp" e nao "Telefone" de proposito: o rotulo ja responde
    // "por que voces querem meu numero?" antes da pessoa perguntar — e o canal
    // de aviso e exatamente esse.
    name: "whatsapp",
    label: "WhatsApp",
    placeholder: "(11) 91234-5678",
    type: "tel",
    autoComplete: "tel-national",
    inputMode: "tel",
  },
  {
    name: "email",
    label: "E-mail",
    placeholder: "voce@email.com",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
  },
];

export default function Formulario() {
  const reduce = useReducedMotionSafe();

  const [values, setValues] = React.useState<Values>(EMPTY);
  const [errors, setErrors] = React.useState<Errors>({});
  const [touched, setTouched] = React.useState<Partial<Record<FieldName, boolean>>>({});
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const setField = (name: FieldName, raw: string) => {
    const value = name === "whatsapp" ? maskPhone(raw) : raw;
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      // Revalida durante a digitacao SO pra apagar um erro ja visivel (a pessoa
      // esta consertando). Nunca pra criar um erro novo — quem esta no meio de
      // "gu" ainda nao errou o e-mail, so nao terminou de escrever.
      if (errors[name]) {
        const fresh = validate(next);
        if (!fresh[name]) setErrors((e) => ({ ...e, [name]: undefined }));
      }
      return next;
    });
  };

  const handleBlur = (name: FieldName) => {
    setTouched((t) => ({ ...t, [name]: true }));
    const fresh = validate(values);
    setErrors((e) => ({ ...e, [name]: fresh[name] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    const fresh = validate(values);
    setErrors(fresh);
    setTouched({ nome: true, whatsapp: true, email: true });
    if (Object.keys(fresh).length > 0) {
      // Foco no primeiro campo com erro: sem isso, num celular a pessoa fica
      // olhando pro botao sem ver a mensagem que apareceu acima da dobra.
      const first = FIELDS.find((f) => fresh[f.name]);
      if (first) document.getElementById(`form-${first.name}`)?.focus();
      return;
    }

    setSubmitError(null);
    setStatus("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: values.nome.trim(),
          whatsapp: values.whatsapp,
          email: values.email.trim(),
          // Honeypot: campo invisivel que so um robo preenche. Ver o input
          // escondido no fim do <form>.
          website: (document.getElementById("form-website") as HTMLInputElement)
            ?.value ?? "",
        }),
      });

      if (!response.ok) throw new Error(String(response.status));
      setStatus("done");
    } catch {
      setStatus("idle");
      setSubmitError(
        "Não conseguimos enviar agora. Tente de novo em alguns segundos."
      );
    }
  };

  return (
    <section
      id="formulario"
      // Fundo #0C0C0E: o mesmo tom de Interface e Futuro. A pagina alterna tres
      // tons pra nenhuma secao encostar noutra do mesmo tom — aqui, entre
      // Depoimentos (ink-900) e Precos (ink-950), esse e o unico que fecha a
      // conta sem inventar um quarto tom.
      // laptop:* (ver tailwind.config.ts): tela de desktop, mas baixa — o que
      // cede sao os respiros de topo e rodape.
      className="relative overflow-hidden border-t border-white/[0.07] bg-[#0C0C0E] px-6 pb-24 pt-20 sm:pb-28 sm:pt-28 lg:px-10 laptop:pb-16 laptop:pt-16 wide:px-16"
    >
      {/* linha divisoria: mesmo brilho estatico (sem animacao) das outras
          secoes — ver Testimonials.tsx/Roadmap.tsx. Fica por cima do border-t
          solido do <section>, que continua ali por baixo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {/* Halo unico atras do cartao: uma pintura so, estatica. Nao entra shader
          nem canvas aqui de proposito — esta secao e a unica da pagina em que a
          pessoa DIGITA, e nada decorativo deve competir por frame com o teclado
          do celular abrindo/fechando. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[140px]"
      />

      <div className="relative mx-auto max-w-6xl wide:max-w-shell">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="flex justify-center">
            <SectionEyebrow>Lista de espera</SectionEyebrow>
          </div>
          {/* Mesma formula de fonte fluida das demais secoes (ver
              Testimonials.tsx/Roadmap.tsx) + wrapper mx-auto w-fit pra linha
              do titulo casar com a largura da frase em qualquer tela. */}
          <div className="mx-auto w-fit">
            <h2 className="mt-5 whitespace-nowrap leading-tight font-display text-[length:clamp(0.9rem,calc(10.22vw_-_5.52px),3rem)] font-semibold tracking-[-0.02em] text-[#FAFAFA] laptop:text-[2.625rem]">
              Entre para a lista
            </h2>
            <div
              aria-hidden
              className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent laptop:mt-1.5"
            />
          </div>
          <p className="mx-auto mt-3 max-w-[54ch] text-lg font-light leading-relaxed text-white/55 laptop:mt-2">
            Avisamos você assim que o Jarvis for lançado — e quem entra agora
            garante o preço de lançamento.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="mx-auto mt-10 max-w-xl laptop:mt-8"
        >
          <div className="rounded-card border border-white/[0.1] bg-ink-800/60 p-6 shadow-sm sm:p-8">
            {/* mode="wait": o formulario sai inteiro antes do painel de sucesso
                entrar, senao os dois se sobrepoem e o cartao pula de altura no
                meio da troca. Mesmo mecanismo do RotatingTrust em
                Testimonials.tsx. */}
            <AnimatePresence mode="wait" initial={false}>
              {status === "done" ? (
                <motion.div
                  key="sucesso"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  role="status"
                  className="flex flex-col items-center py-2 text-center"
                >
                  <CheckCircle
                    size={44}
                    weight="light"
                    aria-hidden
                    className="text-[#FAFAFA]"
                  />
                  <p className="mt-4 text-xl font-semibold text-[#FAFAFA]">
                    Você está na lista!
                  </p>
                  <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-white/55">
                    {WHATSAPP_COMMUNITY_URL
                      ? "Entre agora na comunidade no WhatsApp — é lá que os avisos de lançamento saem primeiro."
                      : "Em breve você recebe o convite da nossa comunidade no WhatsApp e um e-mail de confirmação."}
                  </p>
                  {WHATSAPP_COMMUNITY_URL ? (
                    <a
                      href={WHATSAPP_COMMUNITY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-6 inline-flex items-center gap-2.5 rounded-full bg-[#FAFAFA] px-8 py-3.5 text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white active:scale-[0.98]"
                    >
                      <WhatsappLogo size={18} weight="fill" aria-hidden />
                      Entrar na comunidade
                    </a>
                  ) : null}
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  onSubmit={handleSubmit}
                  // noValidate: a validacao e nossa (mensagens em portugues, no
                  // lugar certo, no momento certo). O balao nativo do navegador
                  // dispararia antes e por cima, em ingles em parte dos casos.
                  noValidate
                  className="flex flex-col gap-4"
                >
                  {FIELDS.map((field) => {
                    const error = touched[field.name]
                      ? errors[field.name]
                      : undefined;
                    return (
                      <div key={field.name}>
                        <label
                          htmlFor={`form-${field.name}`}
                          className="flex items-center gap-1.5 text-xs font-medium text-white/45"
                        >
                          {field.label}
                          {error ? (
                            <WarningCircle
                              size={13}
                              weight="bold"
                              aria-hidden
                              className="text-white/70"
                            />
                          ) : null}
                        </label>
                        {/* Erro sinalizado por CONTRASTE e MOVIMENTO, nunca por
                            cor: a pagina inteira e monocromatica (ver o
                            comentario no topo de tailwind.config.ts), entao um
                            vermelho aqui seria o unico acento do site. A borda
                            sobe de white/10 pra white/45 e o campo da um tranco
                            horizontal curto. */}
                        <motion.div
                          animate={
                            error && !reduce
                              ? { x: [0, -6, 6, -4, 4, 0] }
                              : { x: 0 }
                          }
                          transition={{ duration: 0.32, ease: "easeInOut" }}
                        >
                          <input
                            id={`form-${field.name}`}
                            name={field.name}
                            type={field.type}
                            inputMode={field.inputMode}
                            autoComplete={field.autoComplete}
                            placeholder={field.placeholder}
                            value={values[field.name]}
                            onChange={(e) => setField(field.name, e.target.value)}
                            onBlur={() => handleBlur(field.name)}
                            aria-invalid={error ? true : undefined}
                            aria-describedby={
                              error ? `form-${field.name}-erro` : undefined
                            }
                            className={cn(
                              "mt-1.5 w-full rounded-chip border bg-ink-900 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/40",
                              error ? "border-white/45" : "border-white/10"
                            )}
                          />
                        </motion.div>
                        {error ? (
                          <p
                            id={`form-${field.name}-erro`}
                            role="alert"
                            className="mt-1.5 text-xs text-white/60"
                          >
                            {error}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}

                  {/* Honeypot: invisivel pra gente, preenchido por robo de
                      formulario. tabIndex -1 + aria-hidden mantem ele fora do
                      caminho de quem navega por teclado ou leitor de tela.
                      Escondido por posicionamento, nao por display:none — parte
                      dos robos ignora campo com display:none. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-[-9999px] h-px w-px overflow-hidden opacity-0"
                  >
                    <input
                      id="form-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      defaultValue=""
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    // Mesma pilula solida do CTA de Futuro (Roadmap.tsx) que
                    // traz a pessoa ate aqui — inclusive o texto, pra o clique
                    // parecer continuacao e nao troca de assunto.
                    className="group mt-2 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#FAFAFA] px-9 py-4 text-base font-semibold text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_-12px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
                  >
                    {status === "loading" ? (
                      <>
                        Enviando…
                        <CircleNotch
                          size={17}
                          weight="bold"
                          aria-hidden
                          className="animate-spin"
                        />
                      </>
                    ) : (
                      <>
                        Quero ser notificado!
                        <ArrowRight
                          size={17}
                          weight="bold"
                          aria-hidden
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>

                  {submitError ? (
                    <p
                      role="alert"
                      className="text-center text-xs text-white/60"
                    >
                      {submitError}
                    </p>
                  ) : null}

                  {/* Uma linha, tres trabalhos: privacidade (o dado e telefone,
                      entao a promessa precisa estar visivel ANTES do envio),
                      qual canal vai avisar, e o que acontece depois de clicar. */}
                  <p className="text-center text-xs leading-relaxed text-white/40">
                    Seus dados ficam só com a Estus Corporation — sem spam, sem
                    revenda. O aviso de lançamento sai na nossa comunidade do
                    WhatsApp, com e-mail de confirmação como reforço.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

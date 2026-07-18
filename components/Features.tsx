"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Mic,
  Globe,
  AppWindow,
  TerminalSquare,
  Music,
  MessageCircle,
  Eye,
  Brain,
  Gamepad2,
  Github,
  Keyboard,
  AudioLines,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Ativação por voz",
    description:
      'Diga "Jarvis" e comece a falar. Palavra de ativação e atalho global configuráveis, sem precisar tocar no mouse.',
  },
  {
    icon: Globe,
    title: "Controle do navegador",
    description:
      "Pausa, toca, navega e comanda o Chrome direto pela voz — inclusive vídeos do YouTube, com extensão dedicada.",
  },
  {
    icon: AppWindow,
    title: "Abre e fecha programas",
    description:
      "Peça para abrir, fechar ou trocar de aplicativo no Windows sem precisar procurar o ícone.",
  },
  {
    icon: TerminalSquare,
    title: "Terminal e automações",
    description:
      "Executa comandos PowerShell, ações Git e tarefas de desenvolvimento — o Jarvis também é um dev sênior de bolso.",
  },
  {
    icon: Music,
    title: "Integração com Spotify",
    description:
      "Toca, pausa, pula faixa e busca músicas, álbuns ou artistas com um comando de voz natural.",
  },
  {
    icon: MessageCircle,
    title: "Automação de WhatsApp",
    description:
      "Envia mensagens e executa ações no WhatsApp sem você precisar pegar no celular.",
  },
  {
    icon: Eye,
    title: "Visão de tela",
    description:
      "Captura e entende o que está na sua tela para responder perguntas sobre o que você está vendo.",
  },
  {
    icon: Brain,
    title: "Memória persistente",
    description:
      "Lembra de fatos e preferências que você contou, e usa esse contexto em conversas futuras.",
  },
  {
    icon: AudioLines,
    title: "Voz clonada, a sua",
    description:
      "Responde com uma síntese de voz treinada na sua própria voz — natural, fluida e sem gap entre frases.",
  },
  {
    icon: Gamepad2,
    title: "Detecção de jogos",
    description:
      'Sabe qual jogo você está jogando no momento, via Steam ou reconhecimento de processo — pergunte "que jogo eu tô jogando?".',
  },
  {
    icon: Github,
    title: "Ações de GitHub",
    description:
      "Clona repositórios e executa ações Git diretamente por comando de voz, sem sair do fluxo.",
  },
  {
    icon: Keyboard,
    title: "Personalidade configurável",
    description:
      "Ajuste o tom e o comportamento do Jarvis nas configurações — formal, direto ou do seu jeito.",
  },
];

export default function Features() {
  return (
    <section id="recursos" className="relative bg-black px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] px-4 py-1.5 text-xs font-medium tracking-wide text-gray-300">
            Recursos
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Um assistente que age no seu computador,
            <br className="hidden sm:block" /> não só no chat.
          </h2>
          <p className="mt-4 text-base font-light text-white/60 sm:text-lg">
            Cada recurso do Jarvis foi feito para tirar uma tarefa das suas
            mãos — literalmente.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: (i % 3) * 0.08 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.05]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white">
                <feature.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

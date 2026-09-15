import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — Jarvis",
  description:
    "Condições para uso do assistente de voz Jarvis, do aplicativo para Windows e da extensão para o Google Chrome.",
  alternates: { canonical: "/termos" },
};

const ATUALIZADO_EM = "14 de setembro de 2026";

export default function TermosDeUso() {
  return (
    <main className="min-h-screen bg-black text-neutral-300 antialiased">
      <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
        <Link
          href="/"
          className="inline-block text-sm text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-500"
        >
          Voltar para o Jarvis
        </Link>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Termos de Uso
        </h1>
        <p className="mt-4 text-sm text-neutral-500">
          Última atualização: {ATUALIZADO_EM}
        </p>

        <div className="mt-14 space-y-12 text-[15px] leading-relaxed [&_a]:text-neutral-100 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-white">
          <section>
            <p className="text-lg leading-relaxed text-neutral-200">
              Estes termos valem entre você e a Estus Corporation e regem o uso
              do Jarvis. Ao instalar ou usar o aplicativo, você concorda com
              eles. Se não concordar, não use o Jarvis.
            </p>
          </section>

          <Secao n={1} titulo="O que é o Jarvis">
            <p>
              O Jarvis é um assistente de voz que roda localmente no Windows.
              Ele entende comandos falados e, a partir deles, abre programas,
              executa comandos de terminal, controla o navegador por meio de
              uma extensão do Google Chrome e, quando você autoriza, lê e cria
              eventos no seu Google Agenda.
            </p>
          </Secao>

          <Secao n={2} titulo="Conta Google e integrações">
            <p>
              Conectar sua Conta Google é opcional e serve para habilitar os
              recursos de agenda. Ao conectar, você autoriza o Jarvis a acessar
              os dados descritos na{" "}
              <Link href="/privacidade">Política de Privacidade</Link>, e
              apenas esses.
            </p>
            <p>
              Você pode desconectar a qualquer momento pelo aplicativo ou em{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
              >
                myaccount.google.com/permissions
              </a>
              . Sem a conexão, o Jarvis continua funcionando com uma agenda
              local.
            </p>
          </Secao>

          <Secao n={3} titulo="Execução de comandos no seu computador">
            <p>
              Esta é a parte mais importante destes termos. O Jarvis executa
              ações reais no seu sistema, incluindo comandos de terminal. Um
              comando mal formulado, ou interpretado de forma diferente da que
              você pretendia, pode alterar configurações, mover ou apagar
              arquivos.
            </p>
            <p>
              Você é responsável pelos comandos que emite e pelas consequências
              deles. Antes de usar o Jarvis em tarefas sensíveis, mantenha
              backups. Confira o que foi entendido antes de confirmar ações
              destrutivas.
            </p>
          </Secao>

          <Secao n={4} titulo="Uso aceitável">
            <p>Você concorda em não usar o Jarvis para:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-neutral-600">
              <li>praticar qualquer atividade ilegal;</li>
              <li>
                acessar sistemas, contas ou dados de terceiros sem autorização;
              </li>
              <li>
                distribuir malware ou automatizar ataques contra qualquer
                serviço;
              </li>
              <li>
                violar os termos de serviços de terceiros que o Jarvis acessa,
                incluindo os do Google;
              </li>
              <li>
                fazer engenharia reversa, revender ou redistribuir o aplicativo
                sem autorização por escrito.
              </li>
            </ul>
          </Secao>

          <Secao n={5} titulo="Serviços de terceiros">
            <p>
              O Jarvis integra serviços de terceiros, como as APIs do Google.
              Esses serviços têm termos próprios, que você também precisa
              cumprir. Não respondemos por indisponibilidade, mudanças ou
              descontinuação de serviços que não controlamos.
            </p>
          </Secao>

          <Secao n={6} titulo="Propriedade intelectual">
            <p>
              O Jarvis, seu nome, sua identidade visual e seu código-fonte
              pertencem à Estus Corporation. Estes termos concedem a você uma
              licença pessoal, limitada, revogável e não exclusiva de uso do
              aplicativo, e nada além disso.
            </p>
            <p>
              O conteúdo que você cria usando o Jarvis, como os eventos que
              você dita, continua sendo seu.
            </p>
          </Secao>

          <Secao n={7} titulo="Disponibilidade e garantias">
            <p>
              O Jarvis é fornecido no estado em que se encontra. Não garantimos
              que ele funcionará sem interrupções, que interpretará todos os
              comandos corretamente ou que será compatível com qualquer
              configuração específica de hardware ou software.
            </p>
            <p>
              Podemos alterar, suspender ou descontinuar funcionalidades a
              qualquer momento.
            </p>
          </Secao>

          <Secao n={8} titulo="Limitação de responsabilidade">
            <p>
              Na máxima extensão permitida pela legislação brasileira, a Estus
              Corporation não responde por danos indiretos, lucros cessantes,
              perda de dados ou interrupção de atividades decorrentes do uso ou
              da impossibilidade de uso do Jarvis.
            </p>
            <p>
              Nada nesta cláusula afasta direitos que o Código de Defesa do
              Consumidor garante e que não podem ser limitados por contrato.
            </p>
          </Secao>

          <Secao n={9} titulo="Encerramento">
            <p>
              Você pode parar de usar o Jarvis a qualquer momento
              desinstalando-o. Podemos encerrar o seu acesso em caso de
              descumprimento destes termos, especialmente da seção de uso
              aceitável.
            </p>
          </Secao>

          <Secao n={10} titulo="Alterações nestes termos">
            <p>
              Podemos atualizar estes termos. A data no topo da página indica a
              versão vigente. Mudanças relevantes serão comunicadas dentro do
              aplicativo antes de entrarem em vigor. Continuar usando o Jarvis
              após a comunicação significa aceitar a nova versão.
            </p>
          </Secao>

          <Secao n={11} titulo="Lei aplicável e foro">
            <p>
              Estes termos são regidos pelas leis da República Federativa do
              Brasil. Fica eleito o foro da comarca de São Carlos, São Paulo,
              para dirimir controvérsias, ressalvado o direito do consumidor de
              propor ação no foro de seu domicílio.
            </p>
          </Secao>

          <Secao n={12} titulo="Contato">
            <p>
              Estus Corporation — São Carlos, São Paulo, Brasil
              <br />
              <a href="mailto:estuscorporation@gmail.com">
                estuscorporation@gmail.com
              </a>
            </p>
          </Secao>
        </div>

        <footer className="mt-20 border-t border-neutral-900 pt-8 text-sm text-neutral-600">
          <Link
            href="/privacidade"
            className="underline underline-offset-4 transition-colors hover:text-neutral-300"
          >
            Política de Privacidade
          </Link>
        </footer>
      </div>
    </main>
  );
}

function Secao({
  n,
  titulo,
  children,
}: {
  n: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex gap-4 text-xl font-medium tracking-tight text-white">
        <span className="tabular-nums text-neutral-600">{n}</span>
        <span>{titulo}</span>
      </h2>
      <div className="space-y-4 pl-0 sm:pl-8">{children}</div>
    </section>
  );
}

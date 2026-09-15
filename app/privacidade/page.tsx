import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — Jarvis",
  description:
    "Como o Jarvis coleta, usa, armazena e protege os dados dos usuários, incluindo os dados recebidos das APIs do Google.",
  alternates: { canonical: "/privacidade" },
};

const ATUALIZADO_EM = "14 de setembro de 2026";

export default function PoliticaDePrivacidade() {
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
          Política de Privacidade
        </h1>
        <p className="mt-4 text-sm text-neutral-500">
          Última atualização: {ATUALIZADO_EM}
        </p>

        <div className="mt-14 space-y-12 text-[15px] leading-relaxed [&_a]:text-neutral-100 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-white">
          <section>
            <p className="text-lg leading-relaxed text-neutral-200">
              O Jarvis é um assistente de voz que roda no seu próprio
              computador. Os seus dados ficam no seu computador. Nós não
              mantemos servidores que armazenam o conteúdo da sua agenda, dos
              seus comandos ou dos seus arquivos.
            </p>
          </section>

          <Secao n={1} titulo="Quem somos">
            <p>
              O Jarvis é desenvolvido e mantido pela Estus Corporation, sediada
              em São Carlos, São Paulo, Brasil. Para qualquer assunto
              relacionado a privacidade, o contato é{" "}
              <a href="mailto:estuscorporation@gmail.com">
                estuscorporation@gmail.com
              </a>
              .
            </p>
            <p>
              Esta política se aplica ao aplicativo Jarvis para Windows, à
              extensão do Jarvis para o Google Chrome e ao site{" "}
              <a href="https://www.primejarvis.com.br">primejarvis.com.br</a>.
            </p>
          </Secao>

          <Secao n={2} titulo="Dados que o Jarvis acessa">
            <p>
              O Jarvis só acessa dados depois que você autoriza explicitamente.
              Nada é coletado antes disso.
            </p>

            <h3 className="mt-8 text-base font-medium text-white">
              Dados da sua Conta Google
            </h3>
            <p>
              Quando você conecta sua Conta Google, o Jarvis recebe seu
              endereço de e-mail principal e um identificador da conta, por
              meio dos escopos <Codigo>openid</Codigo> e{" "}
              <Codigo>userinfo.email</Codigo>. Isso serve apenas para o Jarvis
              saber a qual conta a agenda conectada pertence e exibir isso na
              interface.
            </p>

            <h3 className="mt-8 text-base font-medium text-white">
              Dados do Google Agenda
            </h3>
            <p>
              Com o escopo <Codigo>calendar.events</Codigo>, o Jarvis lê os
              eventos futuros da sua agenda para poder falar seus compromissos
              em voz alta, e cria eventos quando você dita um novo compromisso.
              O Jarvis acessa apenas a agenda da conta que você conectou. Ele
              não acessa agendas de outras pessoas, não lê convidados de
              eventos para nenhuma finalidade além de exibi-los a você, e não
              apaga eventos que você não tenha pedido para apagar.
            </p>

            <h3 className="mt-8 text-base font-medium text-white">
              Comandos de voz e texto
            </h3>
            <p>
              Para entender o que você pediu, o Jarvis processa o áudio captado
              pelo microfone e o converte em texto. O microfone só é ativado
              mediante a sua ação. O Jarvis não grava o ambiente de forma
              contínua e não armazena gravações de áudio.
            </p>

            <h3 className="mt-8 text-base font-medium text-white">
              Lista de espera do site
            </h3>
            <p>
              Se você se cadastrar na lista de espera em{" "}
              <a href="https://www.primejarvis.com.br">primejarvis.com.br</a>,
              guardamos o endereço de e-mail que você informou, com a única
              finalidade de avisar sobre o lançamento. Você pode pedir a
              remoção a qualquer momento pelo e-mail de contato.
            </p>
          </Secao>

          <Secao n={3} titulo="Onde os dados ficam">
            <p>
              Os eventos da agenda, o histórico de comandos e as credenciais de
              acesso (tokens de autorização do Google) são armazenados
              localmente, no seu computador, no perfil do seu usuário do
              Windows. Eles não são enviados para servidores da Estus
              Corporation.
            </p>
            <p>
              Isso significa que a segurança desses dados depende também da
              segurança do seu computador. Quem tiver acesso físico ou remoto à
              sua máquina pode alcançá-los.
            </p>
          </Secao>

          <Secao n={4} titulo="Uso Limitado dos dados das APIs do Google">
            <p className="rounded-md border border-neutral-800 bg-neutral-950 p-5 text-neutral-200">
              O uso e a transferência, pelo Jarvis, de informações recebidas
              das APIs do Google para qualquer outro aplicativo obedecem à{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , incluindo os requisitos de Uso Limitado (Limited Use).
            </p>
            <p className="rounded-md border border-neutral-800 bg-neutral-950 p-5 text-neutral-200">
              Jarvis&rsquo;s use and transfer of information received from
              Google APIs to any other app will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p>Em termos práticos, os dados do Google Agenda nunca são:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-neutral-600">
              <li>vendidos, alugados ou cedidos a terceiros;</li>
              <li>
                usados para publicidade, remarketing ou construção de perfis
                para anúncios;
              </li>
              <li>
                usados para treinar modelos de inteligência artificial,
                generalizados ou não;
              </li>
              <li>
                acessados por pessoas, exceto quando você autorizar
                explicitamente para suporte, quando a lei exigir, ou quando for
                necessário e de forma agregada e anonimizada para segurança do
                serviço.
              </li>
            </ul>
          </Secao>

          <Secao n={5} titulo="Compartilhamento com terceiros">
            <p>
              O Jarvis não compartilha os dados da sua agenda com terceiros.
            </p>
            <p>
              Para interpretar linguagem natural, o texto dos seus comandos
              pode ser enviado ao provedor de modelo de linguagem utilizado
              pelo Jarvis (por meio do Jarvis Credits Server, nossa camada de
              intermediação, que pode trocar de provedor de IA ao longo do
              tempo), exclusivamente para gerar a resposta daquele pedido. Esse
              envio contém apenas o comando em si e o contexto mínimo
              necessário. Quando o comando envolve a sua agenda, o Jarvis envia
              somente os campos indispensáveis (título, data e horário) e nunca
              suas credenciais de acesso.
            </p>
          </Secao>

          <Secao n={6} titulo="Extensão para o Google Chrome">
            <p>
              A extensão do Jarvis para o Chrome existe para que o assistente
              possa executar ações que você pediu no navegador, como abrir uma
              página ou preencher um campo. Ela se comunica apenas com o
              aplicativo Jarvis rodando na sua própria máquina.
            </p>
            <p>
              A extensão não coleta seu histórico de navegação, não lê senhas
              salvas, não monitora abas em segundo plano e não envia o conteúdo
              das páginas que você visita para nenhum servidor externo.
            </p>
          </Secao>

          <Secao n={7} titulo="Retenção e exclusão">
            <p>
              Como os dados ficam no seu computador, você controla a exclusão
              diretamente. Desinstalar o Jarvis remove o aplicativo e os dados
              locais associados a ele, incluindo os tokens de acesso.
            </p>
            <p>
              Se você tiver se cadastrado na lista de espera, envie um pedido
              para{" "}
              <a href="mailto:estuscorporation@gmail.com">
                estuscorporation@gmail.com
              </a>{" "}
              e o seu e-mail será removido em até 30 dias.
            </p>
          </Secao>

          <Secao n={8} titulo="Como revogar o acesso à sua Conta Google">
            <p>
              A qualquer momento, você pode desconectar o Jarvis na própria
              interface do aplicativo, ou revogar a autorização diretamente no
              Google em{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
              >
                myaccount.google.com/permissions
              </a>
              . Revogar o acesso invalida imediatamente os tokens armazenados
              localmente.
            </p>
          </Secao>

          <Secao n={9} titulo="Seus direitos">
            <p>
              A LGPD (Lei Geral de Proteção de Dados, Lei nº 13.709/2018)
              garante a você o direito de confirmar a existência de tratamento
              dos seus dados, acessá-los, corrigi-los, solicitar sua exclusão,
              revogar consentimento e pedir a portabilidade das informações.
            </p>
            <p>
              Para exercer qualquer um desses direitos, escreva para{" "}
              <a href="mailto:estuscorporation@gmail.com">
                estuscorporation@gmail.com
              </a>
              . Respondemos em até 15 dias.
            </p>
          </Secao>

          <Secao n={10} titulo="Segurança">
            <p>
              As comunicações com as APIs do Google usam HTTPS. Os tokens de
              acesso são gravados na área de perfil do seu usuário no Windows e
              nunca são exibidos na interface nem gravados em logs.
            </p>
            <p>
              Nenhum sistema é totalmente imune a falhas. Se identificarmos um
              incidente de segurança que afete seus dados, comunicaremos você e
              a Autoridade Nacional de Proteção de Dados conforme exigido pela
              LGPD.
            </p>
          </Secao>

          <Secao n={11} titulo="Menores de idade">
            <p>
              O Jarvis não se destina a menores de 18 anos e não coletamos
              intencionalmente dados de crianças e adolescentes. Se tomarmos
              conhecimento de que isso ocorreu, excluiremos os dados.
            </p>
          </Secao>

          <Secao n={12} titulo="Alterações nesta política">
            <p>
              Podemos atualizar esta política. A data de última atualização no
              topo da página sempre reflete a versão vigente. Mudanças que
              afetem materialmente o tratamento dos seus dados serão informadas
              dentro do aplicativo antes de entrarem em vigor.
            </p>
          </Secao>

          <Secao n={13} titulo="Contato">
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
            href="/termos"
            className="underline underline-offset-4 transition-colors hover:text-neutral-300"
          >
            Termos de Uso
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

function Codigo({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-neutral-900 px-1.5 py-0.5 text-[13px] text-neutral-200">
      {children}
    </code>
  );
}

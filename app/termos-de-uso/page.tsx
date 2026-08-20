import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de uso do Jarvis: o que é o software, licença de uso, contas de terceiros, responsabilidade do usuário sobre ações no próprio computador e demais condições.",
  alternates: { canonical: "/termos-de-uso" },
};

// Ultima atualizacao dos textos legais. Atualize esta constante (e a de
// app/politica-de-privacidade/page.tsx) sempre que o conteudo mudar de
// verdade — nao a cada deploy.
const UPDATED_AT = "20/08/2026";

const SUPPORT_EMAIL = "suporte@estuscorporation.com.br";
const WHATSAPP = "+55 (16) 99238-6188";
const CITY_UF = "São Carlos/SP";
const FULL_NAME = "Gustavo Nunes";
const CPF = "528.016.058-08";

export default function TermosDeUsoPage() {
  return (
    <LegalLayout
      eyebrow="Documento legal"
      title="Termos de Uso"
      updatedAt={UPDATED_AT}
    >
      <p>
        <strong>Fornecedor:</strong> {FULL_NAME}, inscrito no CPF {CPF},
        pessoa física, com contato em{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        (&ldquo;nós&rdquo;, &ldquo;Fornecedor&rdquo;).
      </p>

      <h2>1. Aceitação dos termos</h2>
      <p>
        Ao instalar, ativar ou usar o Jarvis (&ldquo;Software&rdquo;), você
        (&ldquo;Usuário&rdquo;) declara que leu e concorda com estes Termos de
        Uso e com a{" "}
        <a href="/politica-de-privacidade">Política de Privacidade</a>. Se
        você não concordar, não instale nem utilize o Software.
      </p>

      <h2>2. O que é o Jarvis</h2>
      <p>
        O Jarvis é um assistente de voz que roda <strong>localmente</strong>{" "}
        no seu computador Windows. Ele reconhece comandos de voz e executa
        ações no seu próprio sistema (abrir e fechar aplicativos, controlar o
        navegador e mídia, digitar texto, executar comandos, buscar na web,
        automações e integrações), além de conversar por voz usando
        provedores de inteligência artificial de terceiros.
      </p>

      <h2>3. Produto em pré-lançamento e lista de espera</h2>
      <p>
        O Jarvis ainda não está disponível para compra. A página atual
        oferece apenas o cadastro numa lista de espera para aviso de
        lançamento — nenhum pagamento, cobrança, teste gratuito ou licença é
        processado nesta fase. Assim que o Software for disponibilizado para
        contratação, estes Termos serão atualizados com as condições de
        plano, ativação e reembolso, e o Usuário será comunicado antes de
        qualquer cobrança.
      </p>

      <h2>4. Contas e serviços de terceiros (modelo &ldquo;traga sua chave&rdquo;)</h2>
      <p>
        O Jarvis depende de serviços de terceiros de inteligência artificial
        e afins (entre eles OpenAI, Anthropic, Groq e ElevenLabs).{" "}
        <strong>
          O Usuário é responsável por criar e manter suas próprias contas e
          chaves de API
        </strong>{" "}
        nesses provedores e por <strong>pagar os custos</strong> de uso, que
        não estarão incluídos no valor de nenhum plano futuro do Jarvis.
      </p>
      <p>
        O Usuário deve cumprir os termos de uso de cada provedor. Integrações
        não oficiais (por exemplo, automação de mensagens) podem parar de
        funcionar se o terceiro alterar sua plataforma, sem que isso
        configure defeito do Software.
      </p>

      <h2>5. Ações no seu computador e responsabilidade do Usuário</h2>
      <p>
        O Jarvis executa ações no sistema do Usuário{" "}
        <strong>exclusivamente a seu comando</strong> — o que pode incluir
        executar comandos, criar, editar ou apagar arquivos, controlar
        aplicativos e enviar mensagens.
      </p>
      <p>
        Ações potencialmente destrutivas exigem{" "}
        <strong>confirmação explícita</strong> do Usuário antes de serem
        executadas. O Usuário é o <strong>responsável final</strong> por
        autorizar, revisar e supervisionar essas ações, e declara estar
        ciente de que deve <strong>manter backups</strong> de seus dados
        importantes.
      </p>

      <h2>6. Uso aceitável</h2>
      <p>
        O Usuário concorda em não utilizar o Jarvis para: (a) fins ilícitos
        ou que violem direitos de terceiros; (b) danificar, invadir ou
        sobrecarregar sistemas de terceiros; (c) enviar spam ou mensagens não
        autorizadas; (d) automatizar ações que violem leis ou os termos de
        serviços utilizados. Toda automação ocorre{" "}
        <strong>no próprio sistema do Usuário e sob seu comando e responsabilidade</strong>.
      </p>

      <h2>7. Produto em desenvolvimento (early access)</h2>
      <p>
        O Jarvis está em desenvolvimento ativo. Funcionalidades identificadas
        como <strong>beta</strong> podem apresentar instabilidade ou ser
        modificadas, suspensas ou descontinuadas. Fornecemos atualizações
        periódicas para corrigir problemas e adicionar melhorias.
      </p>

      <h2>8. Isenção de garantias e limitação de responsabilidade</h2>
      <p>
        O Software é fornecido &ldquo;<strong>no estado em que se
        encontra</strong>&rdquo; e &ldquo;<strong>conforme
        disponível</strong>&rdquo;. Não garantimos que funcionará sem
        interrupções ou livre de erros, nem nos responsabilizamos pela
        disponibilidade ou pelo comportamento dos serviços de terceiros.
      </p>
      <p>
        Na <strong>máxima extensão permitida pela legislação aplicável</strong>,
        não nos responsabilizamos por danos indiretos, incidentais, perda de
        dados ou lucros cessantes decorrentes do uso do Software, em especial
        de ações que o próprio Usuário autorizou.
      </p>
      <p>
        <strong>
          Nada nestes Termos afasta ou limita os direitos irrenunciáveis do
          consumidor
        </strong>{" "}
        previstos no Código de Defesa do Consumidor e demais normas
        aplicáveis.
      </p>

      <h2>9. Suporte</h2>
      <p>O suporte é oferecido pelos seguintes canais:</p>
      <ul>
        <li>
          <strong>E-mail:</strong>{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </li>
        <li>
          <strong>WhatsApp:</strong> {WHATSAPP}
        </li>
      </ul>
      <p>
        No early access, o acesso direto ao fundador faz parte do produto.
        Prazo estimado de primeira resposta: até 2 (dois) dias úteis.
      </p>

      <h2>10. Alterações destes Termos</h2>
      <p>
        Podemos alterar estes Termos a qualquer tempo. Mudanças relevantes
        serão comunicadas no site e/ou por e-mail. O uso continuado após a
        comunicação implica concordância com a versão revisada.
      </p>

      <h2>11. Legislação aplicável e foro</h2>
      <p>
        Aplica-se a legislação brasileira. Fica eleito o foro da comarca de{" "}
        {CITY_UF} para dirimir eventuais controvérsias,{" "}
        <strong>ressalvado o direito do consumidor</strong> de propor demanda
        no foro de seu domicílio.
      </p>
    </LegalLayout>
  );
}

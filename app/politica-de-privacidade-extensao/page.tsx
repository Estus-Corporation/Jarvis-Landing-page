import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Política de Privacidade — Extensão do Chrome",
  description:
    "Política de privacidade da extensão Jarvis Browser Agent: quais permissões ela usa, quais dados acessa e por que nada sai do seu computador.",
  alternates: { canonical: "/politica-de-privacidade-extensao" },
};

const UPDATED_AT = "14/09/2026";

const SUPPORT_EMAIL = "contato@estuscorporation.com.br";
const CONTROLLER_NAME = "Estus Corporation";

export default function PoliticaDePrivacidadeExtensaoPage() {
  return (
    <LegalLayout
      eyebrow="Documento legal"
      title="Política de Privacidade — Extensão do Chrome"
      updatedAt={UPDATED_AT}
    >
      <p>
        <strong>Controlador dos dados:</strong> {CONTROLLER_NAME}, contato:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>1. O que é o Jarvis Browser Agent</h2>
      <p>
        O <strong>Jarvis Browser Agent</strong> é a extensão complementar do{" "}
        <strong>Jarvis</strong>, um assistente de voz que roda localmente no
        computador Windows do usuário (aplicativo desktop, distribuído
        separadamente). A extensão existe <strong>só</strong> para que o
        Jarvis consiga controlar o Chrome por comando de voz — pausar um
        vídeo, abrir uma aba, navegar, ler o conteúdo de uma página, etc.
        Sozinha, sem o aplicativo Jarvis aberto na mesma máquina, a extensão
        não faz nada.
      </p>

      <h2>2. O princípio central: nada sai do seu computador por causa desta extensão</h2>
      <p>
        A extensão conversa <strong>exclusivamente</strong> com o aplicativo
        Jarvis instalado na <strong>mesma máquina</strong>, através de uma
        conexão local (<code>ws://127.0.0.1:3847</code>, ou seja, o próprio
        computador falando consigo mesmo — essa porta não é acessível pela
        internet). A extensão:
      </p>
      <ul>
        <li>
          <strong>Não envia</strong> dados de navegação, conteúdo de páginas,
          histórico ou formulários para nenhum servidor da Estus Corporation
          ou de terceiros.
        </li>
        <li>
          <strong>Não coleta</strong> dados para publicidade, revenda, análise
          de crédito ou qualquer finalidade fora do controle do navegador
          pedido pelo usuário.
        </li>
        <li>
          <strong>Não executa código arbitrário vindo de fora</strong>: os
          comandos que ela aceita do aplicativo Jarvis são de um conjunto
          fixo e pré-definido (abrir aba, pausar mídia, rolar a página,
          clicar num elemento, etc.) — não há um canal para rodar
          &ldquo;qualquer script&rdquo; enviado remotamente.
        </li>
      </ul>
      <p>
        Quem trata os dados das suas conversas por voz com o Jarvis (áudio,
        texto, IA) é o <strong>aplicativo desktop</strong>, não a extensão —
        veja a{" "}
        <a href="/politica-de-privacidade">
          política de privacidade do Jarvis
        </a>{" "}
        (documento separado) para esse fluxo.
      </p>

      <h2>3. Permissões que a extensão pede, e por quê</h2>
      <table>
        <thead>
          <tr>
            <th>Permissão</th>
            <th>Para que serve</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>tabs</code>
            </td>
            <td>
              Saber qual aba está em foco, seu título/URL, e trocar/fechar/
              criar abas quando o usuário pede por voz.
            </td>
          </tr>
          <tr>
            <td>
              <code>scripting</code>
            </td>
            <td>
              Executar as ações pedidas na página (pausar vídeo, rolar,
              clicar, ler texto/elementos) — só quando um comando chega do
              aplicativo Jarvis.
            </td>
          </tr>
          <tr>
            <td>
              <code>host_permissions: &lt;all_urls&gt;</code>
            </td>
            <td>
              O usuário pode pedir para controlar <strong>qualquer</strong>{" "}
              site que esteja com aba aberta (YouTube, Google, um site de
              trabalho, etc.) — restringir a domínios específicos quebraria o
              propósito da extensão, que é generalista.
            </td>
          </tr>
          <tr>
            <td>
              <code>sessions</code>
            </td>
            <td>
              Reabrir a última aba fechada, quando pedido por voz
              (&ldquo;desfaz&rdquo;, &ldquo;reabre a aba&rdquo;).
            </td>
          </tr>
          <tr>
            <td>
              <code>alarms</code>
            </td>
            <td>
              Manter o service worker da extensão vivo (o Chrome o desliga
              por inatividade em ~5-10s) — não tem relação com dados do
              usuário, é só um &ldquo;ping&rdquo; técnico interno.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>4. Dados que a extensão acessa, e onde ficam</h2>
      <table>
        <thead>
          <tr>
            <th>Dado</th>
            <th>Finalidade</th>
            <th>Sai da sua máquina?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Conteúdo/URL da aba ativa</td>
            <td>
              Executar o comando de voz pedido (ex: &ldquo;que vídeo é
              esse?&rdquo;)
            </td>
            <td>
              Não — só trafega até o aplicativo Jarvis, no mesmo computador
            </td>
          </tr>
          <tr>
            <td>
              Resultado de ações na página (texto lido, elementos
              encontrados)
            </td>
            <td>Devolver a resposta ao Jarvis, que fala/mostra pro usuário</td>
            <td>Não</td>
          </tr>
          <tr>
            <td>Nenhum dado é armazenado pela extensão</td>
            <td>—</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Compartilhamento com terceiros</h2>
      <p>
        A extensão <strong>não vende, não transfere e não compartilha</strong>{" "}
        dados de navegação com terceiros, sob nenhuma circunstância. Ela não
        tem servidor próprio — o único destino de qualquer informação que ela
        lê da página é o aplicativo Jarvis, local, do mesmo usuário.
      </p>

      <h2>6. Retenção</h2>
      <p>
        A extensão não persiste dados. Nada do que ela lê da página fica
        guardado depois que o comando de voz é respondido.
      </p>

      <h2>7. Seus direitos (art. 18 da LGPD)</h2>
      <p>
        Como a extensão não retém dados, não há o que exportar ou apagar
        especificamente dela. Para desativar completamente, remova a
        extensão do Chrome (<code>chrome://extensions</code>) — o Jarvis
        volta a funcionar só com os comandos que não dependem do navegador.
        Para dúvidas, contate{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>8. Segurança</h2>
      <p>
        A conexão entre a extensão e o aplicativo Jarvis é local (
        <code>127.0.0.1</code>), não trafega pela internet nem por
        servidores da Estus Corporation.
      </p>

      <h2>9. Alterações</h2>
      <p>
        Podemos atualizar esta política. Mudanças relevantes serão
        comunicadas na página da extensão na Chrome Web Store.
      </p>

      <h2>10. Contato / Encarregado (DPO)</h2>
      <p>
        {CONTROLLER_NAME} — <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalLayout>
  );
}

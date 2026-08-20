import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de privacidade do Jarvis: quais dados tratamos, base legal, transferência internacional, retenção e seus direitos como titular sob a LGPD.",
  alternates: { canonical: "/politica-de-privacidade" },
};

// Mesma data de app/termos-de-uso/page.tsx — os dois documentos foram
// publicados juntos. Atualize as duas se um dos dois mudar de verdade.
const UPDATED_AT = "20/08/2026";

const SUPPORT_EMAIL = "suporte@estuscorporation.com.br";
const WHATSAPP = "+55 (16) 99238-6188";
const FULL_NAME = "Gustavo Nunes";
const CPF = "528.016.058-08";

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalLayout
      eyebrow="Documento legal"
      title="Política de Privacidade"
      updatedAt={UPDATED_AT}
    >
      <p>
        <strong>Controlador dos dados:</strong> {FULL_NAME}, CPF {CPF},
        contato: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>1. Quem somos e o que esta política cobre</h2>
      <p>
        O Jarvis é um assistente de voz que roda <strong>localmente</strong>{" "}
        no computador Windows do Usuário. Esta política descreve como
        tratamos dados pessoais, em conformidade com a{" "}
        <strong>Lei Geral de Proteção de Dados</strong> (Lei nº
        13.709/2018 — &ldquo;LGPD&rdquo;). Um princípio central do produto:{" "}
        <strong>seus dados e suas chaves ficam no seu computador</strong> —
        não mantemos servidor próprio que armazene seu histórico ou suas
        conversas.
      </p>
      <p>
        Esta página também é o cadastro da{" "}
        <a href="/#formulario">lista de espera</a> de lançamento: os dados
        enviados nesse formulário (nome, WhatsApp e e-mail) são tratados
        conforme a seção 2 abaixo, linha &ldquo;Cadastro na lista de
        espera&rdquo;.
      </p>

      <h2>2. Quais dados tratamos e para quê</h2>
      <table>
        <thead>
          <tr>
            <th>Dado</th>
            <th>Finalidade</th>
            <th>Onde fica</th>
            <th>Compartilhado com terceiros?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nome, WhatsApp e e-mail (cadastro na lista de espera)</td>
            <td>Avisar sobre o lançamento do Jarvis</td>
            <td>Planilha interna (Google Sheets)</td>
            <td>Não</td>
          </tr>
          <tr>
            <td>Voz (áudio do microfone)</td>
            <td>Transcrever sua fala em texto</td>
            <td>Processado em memória (não gravado em disco)</td>
            <td>Sim — provedor de transcrição (Groq e/ou OpenAI)</td>
          </tr>
          <tr>
            <td>Texto das suas mensagens</td>
            <td>Gerar a resposta do assistente</td>
            <td>Histórico encriptado no seu PC</td>
            <td>Sim — provedor de IA (Anthropic e/ou OpenAI)</td>
          </tr>
          <tr>
            <td>Capturas de tela (sob demanda)</td>
            <td>Responder perguntas sobre o que está na tela</td>
            <td>Processada em memória (não gravada)</td>
            <td>Sim — provedor de IA com visão</td>
          </tr>
          <tr>
            <td>Resposta em voz</td>
            <td>Falar a resposta ao Usuário</td>
            <td>Streaming em memória</td>
            <td>Sim — provedor de síntese de voz (ElevenLabs)</td>
          </tr>
          <tr>
            <td>Fatos que você pede para lembrar</td>
            <td>Personalização entre sessões</td>
            <td>Banco local encriptado (SQLite)</td>
            <td>Não</td>
          </tr>
          <tr>
            <td>Histórico de conversas</td>
            <td>Manter contexto entre sessões</td>
            <td>Banco local encriptado</td>
            <td>Não</td>
          </tr>
          <tr>
            <td>Lembretes, tarefas e configurações</td>
            <td>Funcionalidades de produtividade</td>
            <td>Banco local encriptado</td>
            <td>Não</td>
          </tr>
          <tr>
            <td>Contatos que você cadastra (ex.: WhatsApp)</td>
            <td>Enviar mensagens por voz</td>
            <td>Config local encriptada</td>
            <td>Não</td>
          </tr>
          <tr>
            <td>Endereço IP</td>
            <td>Localização aproximada (ex.: clima)</td>
            <td>Em trânsito</td>
            <td>Sim — serviço de geolocalização por IP</td>
          </tr>
          <tr>
            <td>Chaves de API (suas)</td>
            <td>Autenticar as chamadas aos serviços</td>
            <td>Config local encriptada (DPAPI do Windows)</td>
            <td>Apenas aos respectivos provedores</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Base legal do tratamento</h2>
      <p>
        Tratamos os dados com fundamento no <strong>consentimento</strong> do
        titular (art. 7º, I da LGPD) — colhido no envio do formulário da
        lista de espera ou na primeira execução do app — e na{" "}
        <strong>execução de contrato</strong> (art. 7º, V), para entregar as
        funcionalidades que você solicita.
      </p>

      <h2>4. Transferência internacional de dados</h2>
      <p>
        Os provedores de IA e afins (OpenAI, Anthropic, Groq, ElevenLabs)
        processam dados em servidores <strong>fora do Brasil</strong>{" "}
        (majoritariamente nos Estados Unidos). Ao usar o Jarvis, você
        consente com essa transferência, necessária para o funcionamento do
        produto (art. 33 da LGPD). Recomendamos consultar as políticas de
        privacidade de cada provedor.
      </p>

      <h2>5. Compartilhamento</h2>
      <p>
        Não vendemos seus dados. O compartilhamento ocorre{" "}
        <strong>apenas</strong> com os provedores de IA/serviços listados na
        tabela acima, no momento e na medida necessária para executar sua
        solicitação.
      </p>

      <h2>6. Retenção e eliminação</h2>
      <p>
        Os dados locais do aplicativo (histórico, fatos, lembretes,
        configurações) permanecem <strong>no seu computador</strong> até que
        você os apague em Configurações → Privacidade. Áudio e capturas de
        tela <strong>não são armazenados por nós</strong> — apenas trafegam
        para os provedores no instante do uso. Os dados da lista de espera
        (nome, WhatsApp, e-mail) ficam na planilha interna até o lançamento
        do produto ou até você solicitar remoção.
      </p>

      <h2>7. Seus direitos como titular (art. 18 da LGPD)</h2>
      <p>
        A qualquer momento, você pode solicitar{" "}
        <strong>acesso, correção ou eliminação</strong> dos seus dados
        (inclusive os enviados na lista de espera) falando conosco por{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> ou WhatsApp{" "}
        {WHATSAPP}. Dentro do aplicativo (quando lançado), os botões
        &ldquo;Exportar meus dados&rdquo; e &ldquo;Apagar todos os meus
        dados&rdquo; cobrem os dados locais diretamente.
      </p>

      <h2>8. Segurança</h2>
      <p>
        Dados locais sensíveis são <strong>encriptados em repouso</strong> com
        o mecanismo de segurança do próprio Windows (DPAPI / safeStorage). A
        comunicação com os provedores usa <strong>HTTPS</strong>. Ações
        potencialmente destrutivas no seu sistema exigem confirmação
        explícita.
      </p>

      <h2>9. Menores de idade</h2>
      <p>
        O Jarvis não se destina a menores de 18 anos sem a supervisão e o
        consentimento dos responsáveis legais.
      </p>

      <h2>10. Alterações desta política</h2>
      <p>
        Podemos atualizar esta Política de Privacidade. Mudanças relevantes
        serão comunicadas no site e/ou no aplicativo, inclusive com nova
        solicitação de consentimento quando exigido por lei.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas ou solicitações sobre privacidade e dados pessoais:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> · {WHATSAPP}.
      </p>
    </LegalLayout>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiMessageSquare,
  FiGrid,
  FiSettings,
  FiImage,
  FiZap,
  FiBook,
  FiStar,
  FiChevronDown,
  FiChevronRight,
  FiCpu,
  FiLayers,
  FiTarget,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiCode,
  FiPenTool,
  FiGlobe,
  FiSearch,
} from 'react-icons/fi';

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ id, title, icon, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A7C59] to-[#1E3A2F] flex items-center justify-center text-white shadow-lg">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-[#1E3A2F]">{title}</h2>
      </div>
      <div className="prose prose-lg max-w-none">{children}</div>
    </section>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 bg-[#4A7C5910] border border-[#4A7C5930] rounded-xl my-4">
      <FiZap className="w-5 h-5 text-[#4A7C59] flex-shrink-0 mt-0.5" />
      <div className="text-sm text-[#1E3A2F]">{children}</div>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl my-4">
      <FiAlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-orange-800">{children}</div>
    </div>
  );
}

function Example({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[rgba(30,58,47,0.1)] rounded-xl overflow-hidden my-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[#F5F5F0] hover:bg-[#EEEEE8] transition-colors"
      >
        <span className="font-medium text-[#1E3A2F]">{title}</span>
        {isOpen ? (
          <FiChevronDown className="w-5 h-5 text-[#6B6B6B]" />
        ) : (
          <FiChevronRight className="w-5 h-5 text-[#6B6B6B]" />
        )}
      </button>
      {isOpen && <div className="p-4 bg-white text-sm text-[#444]">{children}</div>}
    </div>
  );
}

const tableOfContents = [
  { id: 'introducao', title: 'Introducao ao Sage', icon: <FiBook className="w-4 h-4" /> },
  { id: 'primeiros-passos', title: 'Primeiros Passos', icon: <FiZap className="w-4 h-4" /> },
  { id: 'conversas', title: 'Conversas e Chat', icon: <FiMessageSquare className="w-4 h-4" /> },
  { id: 'ferramentas', title: 'Ferramentas e Bots', icon: <FiGrid className="w-4 h-4" /> },
  { id: 'modelos', title: 'Modelos de IA', icon: <FiCpu className="w-4 h-4" /> },
  { id: 'imagens', title: 'Envio de Imagens', icon: <FiImage className="w-4 h-4" /> },
  { id: 'prompts', title: 'Escrevendo Bons Prompts', icon: <FiPenTool className="w-4 h-4" /> },
  { id: 'casos-uso', title: 'Casos de Uso', icon: <FiTarget className="w-4 h-4" /> },
  { id: 'planos', title: 'Planos e Limites', icon: <FiStar className="w-4 h-4" /> },
  { id: 'dicas-avancadas', title: 'Dicas Avancadas', icon: <FiTrendingUp className="w-4 h-4" /> },
];

export default function TutorialsPage() {
  const [activeSection, setActiveSection] = useState('introducao');

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(30,58,47,0.08)] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1E3A2F] transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar ao Chat</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A7C59] to-[#1E3A2F] flex items-center justify-center text-white font-bold shadow-lg">
                S
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-[#1E3A2F]">Central de Ajuda</h1>
                <p className="text-xs text-[#6B6B6B]">Tutoriais e Guias</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#4A7C59] to-[#1E3A2F] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Aprenda a usar o Sage IA
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Guia completo para aproveitar ao maximo a inteligencia artificial que fala a verdade.
            Do basico ao avancado, tudo o que voce precisa saber.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents - Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-[rgba(30,58,47,0.08)] p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1E3A2F] mb-4 flex items-center gap-2">
                <FiBook className="w-4 h-4" />
                Indice
              </h3>
              <nav className="space-y-1">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === item.id
                        ? 'bg-[#4A7C59] text-white'
                        : 'text-[#6B6B6B] hover:bg-[#F5F5F0] hover:text-[#1E3A2F]'
                    }`}
                  >
                    {item.icon}
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-[rgba(30,58,47,0.08)] p-6 sm:p-8 lg:p-12 shadow-sm space-y-16">
              {/* Introducao */}
              <Section id="introducao" title="Introducao ao Sage" icon={<FiBook className="w-6 h-6" />}>
                <p className="text-[#444] leading-relaxed mb-4">
                  O <strong>Sage IA</strong> e uma plataforma de inteligencia artificial projetada para ser sua
                  assistente pessoal em diversas tarefas do dia a dia. Diferente de outras IAs, o Sage foi
                  criado com um principio fundamental: <em>falar a verdade, sem hipocrisias</em>.
                </p>

                <p className="text-[#444] leading-relaxed mb-4">
                  Nosso objetivo e oferecer respostas honestas, uteis e diretas para suas perguntas,
                  ajudando voce a ser mais produtivo em tarefas como:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-[#444] mb-6">
                  <li>Escrever e-mails, textos e documentos</li>
                  <li>Traduzir conteudos entre idiomas</li>
                  <li>Resumir artigos, videos e livros</li>
                  <li>Programar e debugar codigo</li>
                  <li>Estudar e aprender novos assuntos</li>
                  <li>Criar conteudo criativo</li>
                  <li>Analisar dados e informacoes</li>
                  <li>E muito mais!</li>
                </ul>

                <Tip>
                  <strong>Dica:</strong> O Sage funciona melhor quando voce e especifico sobre o que precisa.
                  Quanto mais contexto voce fornecer, melhores serao as respostas!
                </Tip>
              </Section>

              {/* Primeiros Passos */}
              <Section id="primeiros-passos" title="Primeiros Passos" icon={<FiZap className="w-6 h-6" />}>
                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">1. Criando sua conta</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  Para comecar a usar o Sage, voce precisa criar uma conta. O processo e simples:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-[#444] mb-6">
                  <li>Acesse a pagina de registro</li>
                  <li>Preencha seu nome, e-mail e crie uma senha</li>
                  <li>Confirme seu e-mail (se necessario)</li>
                  <li>Pronto! Voce ja pode comecar a conversar</li>
                </ol>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">2. Interface principal</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  A interface do Sage e dividida em algumas areas principais:
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-[#F5F5F0] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FiMessageSquare className="w-5 h-5 text-[#4A7C59]" />
                      <span className="font-medium text-[#1E3A2F]">Barra Lateral</span>
                    </div>
                    <p className="text-sm text-[#6B6B6B]">
                      Aqui voce encontra suas conversas, pode criar novas, trocar de modelo e acessar configuracoes.
                    </p>
                  </div>
                  <div className="p-4 bg-[#F5F5F0] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FiPenTool className="w-5 h-5 text-[#4A7C59]" />
                      <span className="font-medium text-[#1E3A2F]">Area de Chat</span>
                    </div>
                    <p className="text-sm text-[#6B6B6B]">
                      Onde a magica acontece! Digite suas mensagens e receba respostas da IA.
                    </p>
                  </div>
                  <div className="p-4 bg-[#F5F5F0] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FiGrid className="w-5 h-5 text-[#4A7C59]" />
                      <span className="font-medium text-[#1E3A2F]">Ferramentas</span>
                    </div>
                    <p className="text-sm text-[#6B6B6B]">
                      Bots especializados para tarefas especificas como traducao, codigo e escrita.
                    </p>
                  </div>
                  <div className="p-4 bg-[#F5F5F0] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FiSettings className="w-5 h-5 text-[#4A7C59]" />
                      <span className="font-medium text-[#1E3A2F]">Configuracoes</span>
                    </div>
                    <p className="text-sm text-[#6B6B6B]">
                      Gerencie seu perfil, senha e visualize informacoes do seu plano.
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">3. Sua primeira conversa</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  Para iniciar sua primeira conversa:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-[#444] mb-6">
                  <li>Clique no botao <strong>"Nova Conversa"</strong> na barra lateral</li>
                  <li>Digite sua mensagem no campo de texto na parte inferior</li>
                  <li>Pressione Enter ou clique no botao de enviar</li>
                  <li>Aguarde a resposta da IA</li>
                </ol>
              </Section>

              {/* Conversas e Chat */}
              <Section id="conversas" title="Conversas e Chat" icon={<FiMessageSquare className="w-6 h-6" />}>
                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">Gerenciando conversas</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  O Sage salva automaticamente todas as suas conversas. Voce pode:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-[#444] mb-6">
                  <li><strong>Criar nova conversa:</strong> Clique em "Nova Conversa" para comecar do zero</li>
                  <li><strong>Continuar conversa:</strong> Clique em uma conversa existente na lista</li>
                  <li><strong>Buscar conversas:</strong> Use a barra de busca para encontrar conversas antigas</li>
                  <li><strong>Excluir conversa:</strong> Passe o mouse sobre uma conversa e clique no icone de lixeira</li>
                </ul>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">Contexto da conversa</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  O Sage lembra do contexto da conversa atual. Isso significa que voce pode fazer
                  perguntas de acompanhamento sem precisar repetir informacoes:
                </p>

                <Example title="Exemplo de conversa com contexto">
                  <div className="space-y-3">
                    <div className="p-3 bg-[#4A7C5910] rounded-lg">
                      <span className="text-xs text-[#4A7C59] font-medium">Voce:</span>
                      <p>Quem foi Albert Einstein?</p>
                    </div>
                    <div className="p-3 bg-[#F5F5F0] rounded-lg">
                      <span className="text-xs text-[#6B6B6B] font-medium">Sage:</span>
                      <p>Albert Einstein foi um fisico teorico alemao, considerado um dos maiores cientistas de todos os tempos...</p>
                    </div>
                    <div className="p-3 bg-[#4A7C5910] rounded-lg">
                      <span className="text-xs text-[#4A7C59] font-medium">Voce:</span>
                      <p>Qual foi sua teoria mais famosa?</p>
                    </div>
                    <div className="p-3 bg-[#F5F5F0] rounded-lg">
                      <span className="text-xs text-[#6B6B6B] font-medium">Sage:</span>
                      <p>A teoria mais famosa de Einstein foi a Teoria da Relatividade...</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[#6B6B6B] text-xs">
                    Note que na segunda pergunta nao precisamos mencionar "Einstein" novamente - o Sage entende pelo contexto.
                  </p>
                </Example>

                <Tip>
                  <strong>Dica:</strong> Para mudar de assunto completamente, considere criar uma nova conversa.
                  Isso ajuda a manter o contexto limpo e as respostas mais precisas.
                </Tip>
              </Section>

              {/* Ferramentas e Bots */}
              <Section id="ferramentas" title="Ferramentas e Bots" icon={<FiGrid className="w-6 h-6" />}>
                <p className="text-[#444] leading-relaxed mb-4">
                  O Sage oferece <strong>ferramentas especializadas</strong> (bots) para tarefas especificas.
                  Cada ferramenta e otimizada para um tipo de trabalho:
                </p>

                <div className="grid gap-4 mb-6">
                  <div className="flex items-start gap-4 p-4 border border-[rgba(30,58,47,0.1)] rounded-xl">
                    <div className="text-2xl">🌐</div>
                    <div>
                      <h4 className="font-semibold text-[#1E3A2F]">Tradutor</h4>
                      <p className="text-sm text-[#6B6B6B]">
                        Traduza textos entre diversos idiomas mantendo o contexto e tom original.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border border-[rgba(30,58,47,0.1)] rounded-xl">
                    <div className="text-2xl">📋</div>
                    <div>
                      <h4 className="font-semibold text-[#1E3A2F]">Resumidor</h4>
                      <p className="text-sm text-[#6B6B6B]">
                        Resuma textos longos, artigos, documentos e ate transcricoes de videos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border border-[rgba(30,58,47,0.1)] rounded-xl">
                    <div className="text-2xl">✍️</div>
                    <div>
                      <h4 className="font-semibold text-[#1E3A2F]">Escritor</h4>
                      <p className="text-sm text-[#6B6B6B]">
                        Crie textos, artigos, posts e conteudo criativo com diferentes estilos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border border-[rgba(30,58,47,0.1)] rounded-xl">
                    <div className="text-2xl">📝</div>
                    <div>
                      <h4 className="font-semibold text-[#1E3A2F]">Corretor Gramatical</h4>
                      <p className="text-sm text-[#6B6B6B]">
                        Corrija erros de portugues, melhore a clareza e o estilo do seu texto.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border border-[rgba(30,58,47,0.1)] rounded-xl">
                    <div className="text-2xl">📧</div>
                    <div>
                      <h4 className="font-semibold text-[#1E3A2F]">E-mail Profissional</h4>
                      <p className="text-sm text-[#6B6B6B]">
                        Escreva e-mails profissionais, formais ou informais para diversas situacoes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border border-[rgba(30,58,47,0.1)] rounded-xl">
                    <div className="text-2xl">💻</div>
                    <div>
                      <h4 className="font-semibold text-[#1E3A2F]">Ajuda com Codigo</h4>
                      <p className="text-sm text-[#6B6B6B]">
                        Tire duvidas de programacao, debugue codigo e aprenda novas tecnologias.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">Como usar as ferramentas</h3>
                <ol className="list-decimal pl-6 space-y-2 text-[#444] mb-6">
                  <li>Clique na aba <strong>"Ferramentas"</strong> na barra lateral</li>
                  <li>Escolha a ferramenta adequada para sua tarefa</li>
                  <li>A conversa sera iniciada com o bot especializado</li>
                  <li>Descreva o que voce precisa e a ferramenta vai ajudar</li>
                </ol>

                <Tip>
                  As ferramentas sao pre-configuradas com instrucoes especificas para cada tarefa,
                  o que geralmente resulta em respostas mais precisas do que perguntar diretamente ao chat geral.
                </Tip>
              </Section>

              {/* Modelos de IA */}
              <Section id="modelos" title="Modelos de IA" icon={<FiCpu className="w-6 h-6" />}>
                <p className="text-[#444] leading-relaxed mb-4">
                  O Sage oferece acesso a diversos <strong>modelos de inteligencia artificial</strong>,
                  cada um com caracteristicas proprias. Voce pode trocar de modelo a qualquer momento.
                </p>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">Modelos disponiveis</h3>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(30,58,47,0.1)]">
                        <th className="text-left py-3 px-4 font-semibold text-[#1E3A2F]">Modelo</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#1E3A2F]">Melhor para</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#1E3A2F]">Velocidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[rgba(30,58,47,0.05)]">
                        <td className="py-3 px-4 font-medium">Gemini Flash</td>
                        <td className="py-3 px-4 text-[#6B6B6B]">Uso geral, rapido</td>
                        <td className="py-3 px-4"><span className="text-green-600">Muito rapido</span></td>
                      </tr>
                      <tr className="border-b border-[rgba(30,58,47,0.05)]">
                        <td className="py-3 px-4 font-medium">Gemini Pro</td>
                        <td className="py-3 px-4 text-[#6B6B6B]">Tarefas complexas</td>
                        <td className="py-3 px-4"><span className="text-yellow-600">Moderado</span></td>
                      </tr>
                      <tr className="border-b border-[rgba(30,58,47,0.05)]">
                        <td className="py-3 px-4 font-medium">GPT-4.1</td>
                        <td className="py-3 px-4 text-[#6B6B6B]">Raciocinio, codigo</td>
                        <td className="py-3 px-4"><span className="text-yellow-600">Moderado</span></td>
                      </tr>
                      <tr className="border-b border-[rgba(30,58,47,0.05)]">
                        <td className="py-3 px-4 font-medium">GPT-5</td>
                        <td className="py-3 px-4 text-[#6B6B6B]">Mais avancado</td>
                        <td className="py-3 px-4"><span className="text-orange-600">Mais lento</span></td>
                      </tr>
                      <tr className="border-b border-[rgba(30,58,47,0.05)]">
                        <td className="py-3 px-4 font-medium">Claude 3.7</td>
                        <td className="py-3 px-4 text-[#6B6B6B]">Escrita, analise</td>
                        <td className="py-3 px-4"><span className="text-yellow-600">Moderado</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">Como trocar de modelo</h3>
                <ol className="list-decimal pl-6 space-y-2 text-[#444] mb-6">
                  <li>Na barra lateral, encontre a secao <strong>"Modelo"</strong></li>
                  <li>Clique no modelo atual para abrir o menu</li>
                  <li>Selecione o modelo desejado</li>
                  <li>O proximo envio usara o novo modelo</li>
                </ol>

                <Warning>
                  Modelos mais avancados como GPT-5 e Claude 3.7 podem ser mais lentos para responder,
                  mas geralmente oferecem respostas mais detalhadas e precisas.
                </Warning>
              </Section>

              {/* Envio de Imagens */}
              <Section id="imagens" title="Envio de Imagens" icon={<FiImage className="w-6 h-6" />}>
                <p className="text-[#444] leading-relaxed mb-4">
                  O Sage pode <strong>analisar imagens</strong> que voce enviar. Isso e util para:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-[#444] mb-6">
                  <li>Descrever o conteudo de uma imagem</li>
                  <li>Extrair texto de fotos (OCR)</li>
                  <li>Analisar graficos e diagramas</li>
                  <li>Identificar objetos e pessoas</li>
                  <li>Obter feedback sobre designs</li>
                </ul>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">Como enviar imagens</h3>
                <ol className="list-decimal pl-6 space-y-2 text-[#444] mb-6">
                  <li>Clique no icone de <strong>imagem</strong> ao lado do campo de texto</li>
                  <li>Selecione a imagem do seu computador</li>
                  <li>Aguarde o upload ser concluido</li>
                  <li>Digite sua pergunta sobre a imagem</li>
                  <li>Envie a mensagem</li>
                </ol>

                <Example title="Exemplo de uso com imagem">
                  <div className="space-y-3">
                    <div className="p-3 bg-[#4A7C5910] rounded-lg">
                      <span className="text-xs text-[#4A7C59] font-medium">Voce (com imagem de um grafico):</span>
                      <p>O que este grafico mostra? Quais sao as principais tendencias?</p>
                    </div>
                    <div className="p-3 bg-[#F5F5F0] rounded-lg">
                      <span className="text-xs text-[#6B6B6B] font-medium">Sage:</span>
                      <p>Este grafico mostra as vendas trimestrais de 2024. Posso observar que houve um crescimento de 15% no Q2...</p>
                    </div>
                  </div>
                </Example>

                <Tip>
                  Para melhores resultados, use imagens claras e bem iluminadas.
                  Evite imagens muito pequenas ou desfocadas.
                </Tip>
              </Section>

              {/* Escrevendo Bons Prompts */}
              <Section id="prompts" title="Escrevendo Bons Prompts" icon={<FiPenTool className="w-6 h-6" />}>
                <p className="text-[#444] leading-relaxed mb-4">
                  A qualidade das respostas do Sage depende muito de como voce faz suas perguntas.
                  Aqui estao dicas para escrever <strong>prompts eficientes</strong>:
                </p>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">1. Seja especifico</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-red-600">
                      <FiAlertCircle className="w-4 h-4" />
                      <span className="font-medium text-sm">Evite</span>
                    </div>
                    <p className="text-sm text-red-800">"Escreva um texto sobre marketing"</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-green-600">
                      <FiCheckCircle className="w-4 h-4" />
                      <span className="font-medium text-sm">Prefira</span>
                    </div>
                    <p className="text-sm text-green-800">"Escreva um post de LinkedIn de 200 palavras sobre marketing digital para pequenas empresas de alimentacao"</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">2. Forneca contexto</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  Quanto mais contexto voce fornecer, melhor a resposta:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-[#444] mb-6">
                  <li>Qual e o objetivo final?</li>
                  <li>Quem e o publico-alvo?</li>
                  <li>Qual o tom desejado (formal, informal, tecnico)?</li>
                  <li>Existem restricoes ou requisitos?</li>
                </ul>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">3. Use exemplos</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  Se voce tem um exemplo do que deseja, compartilhe com o Sage:
                </p>

                <Example title="Exemplo de prompt com referencia">
                  <div className="p-3 bg-[#4A7C5910] rounded-lg">
                    <span className="text-xs text-[#4A7C59] font-medium">Bom prompt:</span>
                    <p className="mt-1">
                      "Escreva uma bio para Twitter no estilo deste exemplo: 'Empreendedor | Apaixonado por tecnologia | Construindo o futuro da educacao'.
                      Meu nome e Joao, sou desenvolvedor e gosto de cafe e jogos."
                    </p>
                  </div>
                </Example>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">4. Divida tarefas complexas</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  Para tarefas grandes, divida em etapas:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-[#444] mb-6">
                  <li>Primeiro, peca um esboço ou estrutura</li>
                  <li>Revise e aprove a estrutura</li>
                  <li>Peca para desenvolver cada secao</li>
                  <li>Solicite revisoes e ajustes</li>
                </ol>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">5. Itere e refine</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  Nao tenha medo de pedir ajustes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-[#444] mb-6">
                  <li>"Pode deixar mais formal?"</li>
                  <li>"Resuma em 3 paragrafos"</li>
                  <li>"Adicione mais exemplos praticos"</li>
                  <li>"Reescreva focando em beneficios"</li>
                </ul>
              </Section>

              {/* Casos de Uso */}
              <Section id="casos-uso" title="Casos de Uso" icon={<FiTarget className="w-6 h-6" />}>
                <p className="text-[#444] leading-relaxed mb-6">
                  Veja alguns exemplos praticos de como usar o Sage no seu dia a dia:
                </p>

                <div className="space-y-6">
                  <div className="p-6 bg-[#F5F5F0] rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FiCode className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-[#1E3A2F]">Programacao</h4>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-[#6B6B6B]">
                      <li>Explicar codigo e conceitos</li>
                      <li>Debugar erros e bugs</li>
                      <li>Escrever funcoes e componentes</li>
                      <li>Revisar codigo e sugerir melhorias</li>
                      <li>Converter codigo entre linguagens</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-[#F5F5F0] rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <FiPenTool className="w-5 h-5 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-[#1E3A2F]">Escrita e Conteudo</h4>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-[#6B6B6B]">
                      <li>Escrever artigos e blog posts</li>
                      <li>Criar roteiros para videos</li>
                      <li>Elaborar e-mails profissionais</li>
                      <li>Revisar e melhorar textos</li>
                      <li>Criar legendas para redes sociais</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-[#F5F5F0] rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <FiSearch className="w-5 h-5 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-[#1E3A2F]">Pesquisa e Estudo</h4>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-[#6B6B6B]">
                      <li>Explicar conceitos complexos</li>
                      <li>Resumir livros e artigos</li>
                      <li>Criar flashcards e quizzes</li>
                      <li>Preparar para entrevistas</li>
                      <li>Tirar duvidas sobre qualquer assunto</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-[#F5F5F0] rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FiGlobe className="w-5 h-5 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-[#1E3A2F]">Idiomas</h4>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-[#6B6B6B]">
                      <li>Traduzir textos e documentos</li>
                      <li>Praticar conversacao</li>
                      <li>Aprender gramatica</li>
                      <li>Corrigir erros de idioma</li>
                      <li>Adaptar textos para diferentes culturas</li>
                    </ul>
                  </div>
                </div>
              </Section>

              {/* Planos e Limites */}
              <Section id="planos" title="Planos e Limites" icon={<FiStar className="w-6 h-6" />}>
                <p className="text-[#444] leading-relaxed mb-4">
                  O Sage oferece dois planos para atender diferentes necessidades:
                </p>

                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 border-2 border-[#4A7C59] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FiZap className="w-5 h-5 text-[#4A7C59]" />
                      <h4 className="font-bold text-[#1E3A2F]">Plano Basico</h4>
                    </div>
                    <p className="text-2xl font-bold text-[#1E3A2F] mb-4">R$ 37<span className="text-sm font-normal text-[#6B6B6B]">/mes</span></p>
                    <ul className="space-y-2 text-sm text-[#6B6B6B]">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-[#4A7C59]" />
                        Acesso a todos os modelos
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-[#4A7C59]" />
                        Todas as ferramentas
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-[#4A7C59]" />
                        Historico de conversas
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-[#4A7C59]" />
                        Envio de imagens
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 border-2 border-[#C9A227] rounded-xl bg-gradient-to-br from-[#C9A22708] to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <FiStar className="w-5 h-5 text-[#C9A227]" />
                      <h4 className="font-bold text-[#1E3A2F]">Plano Pro</h4>
                    </div>
                    <p className="text-2xl font-bold text-[#1E3A2F] mb-4">R$ 97<span className="text-sm font-normal text-[#6B6B6B]">/mes</span></p>
                    <ul className="space-y-2 text-sm text-[#6B6B6B]">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-[#C9A227]" />
                        <strong>5x mais uso diario</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-[#C9A227]" />
                        Todos os recursos do Basico
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-[#C9A227]" />
                        Suporte prioritario
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-[#C9A227]" />
                        Acesso antecipado a novidades
                      </li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">Sobre os limites</h3>
                <ul className="list-disc pl-6 space-y-2 text-[#444] mb-6">
                  <li>Os limites sao <strong>diarios</strong> e resetam a meia-noite</li>
                  <li>O plano Pro oferece <strong>5x mais uso</strong> que o Basico</li>
                  <li>Voce pode ver seu uso atual no indicador do chat ou nas configuracoes</li>
                  <li>Ao atingir o limite, voce pode aguardar o reset ou fazer upgrade</li>
                </ul>

                <Tip>
                  Se voce usa o Sage intensamente no trabalho, o plano Pro provavelmente
                  sera mais adequado para suas necessidades.
                </Tip>
              </Section>

              {/* Dicas Avancadas */}
              <Section id="dicas-avancadas" title="Dicas Avancadas" icon={<FiTrendingUp className="w-6 h-6" />}>
                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">Role-play e personas</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  Voce pode pedir ao Sage para assumir diferentes papeis:
                </p>

                <Example title="Exemplo de role-play">
                  <div className="p-3 bg-[#4A7C5910] rounded-lg">
                    <p>
                      "Voce e um especialista em UX Design com 15 anos de experiencia.
                      Analise este wireframe e me de feedback profissional."
                    </p>
                  </div>
                </Example>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3 mt-6">Formatos de saida</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  Peca respostas em formatos especificos:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-[#444] mb-6">
                  <li>"Responda em forma de lista com bullets"</li>
                  <li>"Formate como tabela markdown"</li>
                  <li>"Crie um JSON com esses dados"</li>
                  <li>"Escreva em formato de FAQ"</li>
                </ul>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3">Chain-of-thought</h3>
                <p className="text-[#444] leading-relaxed mb-4">
                  Para problemas complexos, peca ao Sage pensar passo a passo:
                </p>

                <Example title="Exemplo de raciocinio em etapas">
                  <div className="p-3 bg-[#4A7C5910] rounded-lg">
                    <p>
                      "Analise este problema de logica e me explique seu raciocinio passo a passo antes de dar a resposta final."
                    </p>
                  </div>
                </Example>

                <h3 className="text-lg font-semibold text-[#1E3A2F] mb-3 mt-6">Limitacoes a conhecer</h3>
                <Warning>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>O Sage pode cometer erros - sempre verifique informacoes criticas</li>
                    <li>O conhecimento tem uma data de corte - eventos muito recentes podem nao estar atualizados</li>
                    <li>Nao pode acessar a internet ou executar codigo em tempo real</li>
                    <li>Nao deve ser usado para decisoes medicas, juridicas ou financeiras importantes sem consultar profissionais</li>
                  </ul>
                </Warning>

                <div className="mt-8 p-6 bg-gradient-to-r from-[#4A7C5910] to-[#1E3A2F10] rounded-xl text-center">
                  <h3 className="text-lg font-semibold text-[#1E3A2F] mb-2">Precisa de mais ajuda?</h3>
                  <p className="text-[#6B6B6B] mb-4">
                    Se tiver duvidas ou sugestoes, estamos aqui para ajudar!
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A7C59] text-white font-medium rounded-xl hover:bg-[#3d6a4a] transition-colors"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                    Voltar ao Chat
                  </Link>
                </div>
              </Section>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[rgba(30,58,47,0.08)] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[#6B6B6B]">
            Sage IA - A inteligencia artificial que fala a verdade.
          </p>
        </div>
      </footer>
    </div>
  );
}

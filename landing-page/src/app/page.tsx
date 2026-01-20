'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { FiCheck, FiPlay, FiArrowRight, FiX, FiChevronDown, FiStar, FiZap, FiShield, FiMessageCircle } from 'react-icons/fi';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

// Animated Section Component
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Particles Component
function Particles() {
  return (
    <div className="particles">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// Video Modal Component
function VideoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>
        <div className="w-full h-full flex items-center justify-center text-white/50">
          {/* Replace with actual video embed */}
          <p>Video será inserido aqui</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button
        className="faq-question w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <FiChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="faq-answer">{answer}</div>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const [videoOpen, setVideoOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  useEffect(() => {
    // Reveal animations on scroll
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1, rootMargin: '-50px' });

    reveals.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative grid-bg">
      <Particles />

      {/* Fixed Header */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-40 glass-dark"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl">Sage IA</span>
          </div>
          <a href="#planos" className="btn-primary text-sm py-2.5 px-5 hidden sm:inline-flex items-center gap-2">
            Começar Agora <FiArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 pb-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedSection>
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="badge">
                <FiZap className="w-4 h-4 mr-2" />
                A IA Brasileira
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              A IA Que Fala O Que As Outras{' '}
              <span className="gradient-text">Têm Medo De Falar</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl sm:text-2xl md:text-3xl font-medium text-white/80 mb-4"
            >
              Sem censura. Sem frescura. Sem te tratar como idiota.
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-lg text-white/60 mb-10"
            >
              Respostas reais pra pessoas adultas. Finalmente.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#planos" className="btn-primary text-lg py-4 px-8 inline-flex items-center justify-center gap-2">
                Começar Agora <FiArrowRight className="w-5 h-5" />
              </a>
              <button
                onClick={() => setVideoOpen(true)}
                className="btn-secondary text-lg py-4 px-8 inline-flex items-center justify-center gap-2"
              >
                <FiPlay className="w-5 h-5" /> Ver Demonstração
              </button>
            </motion.div>
          </AnimatedSection>

          {/* Hero Decoration */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-sage-500/20 via-transparent to-transparent blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* Video Section */}
      <section className="section py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection className="text-center mb-10">
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl font-bold mb-4">
              Veja a Sage em Ação
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/60">
              Sem enrolação, sem disclaimer, sem pedir desculpas por ter opinião.
            </motion.p>
          </AnimatedSection>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="video-container cursor-pointer"
            onClick={() => setVideoOpen(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sage-700/30 to-black/50">
              <button className="video-play-btn">
                <FiPlay className="w-8 h-8 text-white ml-1" />
              </button>
            </div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/70">
              <FiPlay className="inline w-4 h-4 mr-1" /> 2 minutos que vão mudar como você vê IA
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection>
            <motion.div variants={fadeInUp} className="glass rounded-3xl p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8">
                Vou ser direto com você:
              </h2>

              <div className="space-y-6 text-lg text-white/80 leading-relaxed">
                <p>
                  O ChatGPT foi castrado. O Claude pede desculpas por existir.
                  O Gemini acha que você é uma criança que precisa de supervisão.
                </p>

                <p>
                  Você pergunta algo simples e recebe um textão cheio de{' '}
                  <span className="text-white/40 italic">&ldquo;é importante considerar múltiplas perspectivas&rdquo;</span> e{' '}
                  <span className="text-white/40 italic">&ldquo;como IA, não posso fazer julgamentos&rdquo;</span>.
                </p>

                <p className="text-2xl font-bold text-white pt-4">
                  Isso acaba hoje.
                </p>

                <p>
                  <span className="gradient-text font-semibold">Sage IA</span> é a primeira inteligência artificial brasileira
                  construída pra falar a verdade — mesmo quando a verdade é inconveniente,
                  polêmica, ou &ldquo;problemática&rdquo; pros padrões de São Francisco.
                </p>

                <p className="text-white/60">
                  Não é IA traduzida. Não é IA censurada. Não é IA covarde.
                </p>

                <p className="text-xl font-semibold text-sage-400 pt-2">
                  É a IA que você queria desde o começo.
                </p>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <motion.span variants={fadeInUp} className="badge-gold badge mb-4 inline-block">
              <FiStar className="w-4 h-4 mr-2" /> Benefícios
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Isso é o que você ganha com Sage IA
            </motion.h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <FiMessageCircle className="w-6 h-6" />,
                title: "Opinião de verdade quando você pede opinião",
                desc: "Perguntou se sua ideia é boa? Sage fala se é boa ou se é lixo. Sem rodeios, sem \"depende\", sem ficar em cima do muro pra não te ofender."
              },
              {
                icon: <FiZap className="w-6 h-6" />,
                title: "Copy que vende sem 47 disclaimers",
                desc: "Escreve headline, VSL, email, anúncio — tudo que você precisa pra converter. Sem \"não posso fazer promessas\" ou \"isso pode ser sensível\"."
              },
              {
                icon: "🇧🇷",
                title: "Português brasileiro de verdade",
                desc: "Não é português de Portugal. Não é tradução do inglês. É PT-BR nativo, com gíria, contexto cultural e entendimento real de como brasileiro fala e pensa."
              },
              {
                icon: <FiShield className="w-6 h-6" />,
                title: "Zero armazenamento das suas conversas",
                desc: "Suas perguntas são suas. Não ficam em servidor, não treinam modelo, não vazam. Privacidade real, não marketing."
              },
              {
                icon: "🧠",
                title: "Acesso a múltiplos cérebros com uma assinatura",
                desc: "GPT-4, Claude, Gemini, modelo próprio — tudo numa interface só. Você escolhe qual usar ou deixa Sage decidir."
              },
              {
                icon: "⚡",
                title: "Modos especiais pra tarefas específicas",
                desc: "Copywriter. Consultor de negócios. Desenvolvedor. Ativa o modo e Sage vira especialista no que você precisa."
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 sm:p-8 hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-sage-500/20 flex items-center justify-center text-sage-400 mb-4">
                  {typeof benefit.icon === 'string' ? <span className="text-2xl">{benefit.icon}</span> : benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-white/70 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="section">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection>
            <motion.div variants={fadeInUp} className="bg-gradient-to-br from-sage-700/20 to-sage-900/40 rounded-3xl p-8 sm:p-12 border border-sage-500/20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8">
                Deixa eu ser honesto sobre uma coisa:
              </h2>

              <p className="text-2xl font-bold text-gold mb-8">
                Sage IA não é pra todo mundo.
              </p>

              <div className="space-y-4 mb-10 text-lg text-white/70">
                <p>❌ Se você quer uma IA que concorda com tudo que você fala, Sage não é pra você.</p>
                <p>❌ Se você se ofende fácil, Sage não é pra você.</p>
                <p>❌ Se você acha que IA deveria ter &ldquo;valores alinhados&rdquo; com a cartilha progressista de Stanford, Sage definitivamente não é pra você.</p>
              </div>

              <div className="border-t border-white/10 pt-8">
                <p className="text-xl font-semibold mb-6">Sage foi criada pra:</p>
                <div className="space-y-3 text-lg">
                  <p className="flex items-start gap-3">
                    <span className="text-sage-400 mt-1">✓</span>
                    <span>Adultos que querem ferramentas poderosas — não babás digitais</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-sage-400 mt-1">✓</span>
                    <span>Empreendedores que precisam de respostas rápidas e honestas</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-sage-400 mt-1">✓</span>
                    <span>Profissionais cansados de IA que pede desculpas por fazer seu trabalho</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-sage-400 mt-1">✓</span>
                    <span>Brasileiros que querem uma IA que entende o Brasil de verdade</span>
                  </p>
                </div>
              </div>

              <p className="text-xl font-semibold text-sage-400 mt-8">
                Se você é esse tipo de pessoa, continue lendo.
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              O que estão falando
            </motion.h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Pedi pro ChatGPT escrever um email de cobrança firme. Recebi um texto passivo-agressivo pedindo desculpas por cobrar. Sage escreveu em 10 segundos um email que resolveu meu problema. Simples assim.",
                name: "Marcos",
                role: "Agência de Marketing"
              },
              {
                quote: "Perguntei sobre um tema político. ChatGPT me deu uma redação de vestibular falando dos dois lados. Sage me deu a resposta que eu queria e explicou o raciocínio. Isso é útil.",
                name: "Renata",
                role: "Advogada"
              },
              {
                quote: "Uso pra escrever VSL de suplemento. Sage entende compliance de plataforma mas sabe onde pode apertar. Economizo horas toda semana.",
                name: "Afiliado",
                role: "TikTok Shop"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="testimonial-card"
              >
                <p className="text-white/80 leading-relaxed mb-6 pt-8">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sage-500/20 flex items-center justify-center text-sage-400 font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-white/50">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Anchoring */}
      <section className="section">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AnimatedSection>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-10">
              Pensa comigo:
            </motion.h2>

            <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                { item: "Consultor de negócios", price: "R$500/hora" },
                { item: "Copywriter bom", price: "R$2.000/VSL" },
                { item: "Dev sênior", price: "R$150/hora" },
                { item: "ChatGPT Plus (censurado)", price: "R$100/mês" }
              ].map((row, i) => (
                <div key={i} className="glass rounded-xl p-5 flex justify-between items-center">
                  <span className="text-white/70">{row.item}</span>
                  <span className="font-bold text-gold">{row.price}</span>
                </div>
              ))}
            </motion.div>

            <motion.p variants={fadeInUp} className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Sage IA</span> te dá tudo isso — sem limite, sem censura —{' '}
              <span className="text-gold">por uma fração do preço.</span>
            </motion.p>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="section py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <motion.span variants={fadeInUp} className="badge mb-4 inline-block">
              Escolha seu plano
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Comece a usar agora
            </motion.h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Essential Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="price-card"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Plano Essencial</h3>
                <p className="text-white/60">Pra quem quer sair da censura e começar a usar IA de verdade.</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl sm:text-5xl font-bold">R$37</span>
                <span className="text-white/50">/mês</span>
              </div>

              <ul className="check-list text-white/80 mb-8">
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-sage-400" /></span>
                  <span><strong>500 mensagens/mês</strong> em modelos premium (GPT-4, Claude, Gemini)</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-sage-400" /></span>
                  <span><strong>Mensagens ilimitadas</strong> no modelo Sage</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-sage-400" /></span>
                  <span>Modos especiais (Copywriter, Consultor, Dev)</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-sage-400" /></span>
                  <span>PT-BR nativo</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-sage-400" /></span>
                  <span>Zero armazenamento de conversas</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-sage-400" /></span>
                  <span>Suporte por email</span>
                </li>
              </ul>

              <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-semibold text-gold mb-3">BÔNUS INCLUSOS:</p>
                <div className="space-y-2 text-sm text-white/70">
                  <p>🎁 Newsletter &ldquo;Sage Insights&rdquo; (Valor: R$29/mês)</p>
                  <p>🎁 Biblioteca de Artigos e Tutoriais (Valor: R$97)</p>
                </div>
              </div>

              <a href="https://payt.site/98C5azQ" className="btn-secondary w-full text-center block">
                Começar com o Essencial
              </a>
            </motion.div>

            {/* Professional Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="price-card featured relative"
            >
              <div className="absolute -top-4 right-6">
                <span className="bg-gold text-black text-sm font-bold px-4 py-1.5 rounded-full">
                  MAIS POPULAR
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Plano Profissional</h3>
                <p className="text-white/60">Pra quem usa IA como ferramenta de trabalho e não pode ficar sem.</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl sm:text-5xl font-bold gradient-text-gold">R$97</span>
                <span className="text-white/50">/mês</span>
              </div>

              <ul className="check-list text-white/80 mb-8">
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-gold" /></span>
                  <span><strong>3.000 mensagens/mês</strong> em modelos premium</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-gold" /></span>
                  <span><strong>Mensagens ilimitadas</strong> no modelo Sage</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-gold" /></span>
                  <span>Modos especiais (Copywriter, Consultor, Dev)</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-gold" /></span>
                  <span>PT-BR nativo</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-gold" /></span>
                  <span>Zero armazenamento de conversas</span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-gold" /></span>
                  <span><strong>Suporte prioritário por WhatsApp</strong></span>
                </li>
                <li>
                  <span className="check-icon"><FiCheck className="w-4 h-4 text-gold" /></span>
                  <span>Acesso antecipado a novos recursos</span>
                </li>
              </ul>

              <div className="mb-8 p-4 rounded-xl bg-gold/10 border border-gold/20">
                <p className="text-sm font-semibold text-gold mb-3">TODOS OS BÔNUS + EXCLUSIVOS:</p>
                <div className="space-y-2 text-sm text-white/70">
                  <p>🎁 Biblioteca de Agentes de IA Prontos (Valor: R$297)</p>
                  <p>🎁 Newsletter Premium com Bastidores</p>
                  <p>🎁 Acesso ao Grupo Fechado</p>
                </div>
              </div>

              <a href="https://payt.site/BvCG5DW" className="btn-primary w-full text-center block">
                Quero o Profissional <FiArrowRight className="inline ml-2" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section pt-0">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection>
            <motion.h3 variants={fadeInUp} className="text-2xl font-bold text-center mb-8">
              Comparativo Rápido
            </motion.h3>

            <motion.div variants={fadeInUp} className="overflow-x-auto">
              <table className="comparison-table w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th></th>
                    <th>Essencial</th>
                    <th>Profissional</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium">Preço</td>
                    <td>R$37/mês</td>
                    <td className="text-gold font-medium">R$97/mês</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Mensagens Premium</td>
                    <td>500/mês</td>
                    <td>3.000/mês</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Modelo Sage</td>
                    <td>Ilimitado</td>
                    <td>Ilimitado</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Modos Especiais</td>
                    <td><FiCheck className="text-sage-400" /></td>
                    <td><FiCheck className="text-gold" /></td>
                  </tr>
                  <tr>
                    <td className="font-medium">Newsletter</td>
                    <td>Básica</td>
                    <td>+ Bastidores</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Agentes Prontos</td>
                    <td><FiX className="text-white/30" /></td>
                    <td><FiCheck className="text-gold" /></td>
                  </tr>
                  <tr>
                    <td className="font-medium">Grupo Fechado</td>
                    <td><FiX className="text-white/30" /></td>
                    <td><FiCheck className="text-gold" /></td>
                  </tr>
                  <tr>
                    <td className="font-medium">Suporte</td>
                    <td>Email</td>
                    <td>WhatsApp Prioritário</td>
                  </tr>
                </tbody>
              </table>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="section">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <AnimatedSection>
            <motion.div variants={fadeInUp} className="glass rounded-3xl p-8 sm:p-12 border-2 border-sage-500/30">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-500/20 flex items-center justify-center">
                <FiShield className="w-10 h-10 text-sage-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                7 dias pra testar. Se não gostar, devolvo cada centavo.
              </h2>
              <p className="text-lg text-white/70 mb-4">
                Sem perguntas. Sem burocracia. Sem ressentimento.
              </p>
              <p className="text-white/60">
                Eu sei que Sage entrega. Se você discordar, o risco é meu, não seu.
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section">
        <div className="max-w-3xl mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Dúvidas Frequentes
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection>
            <motion.div variants={fadeInUp}>
              <FAQItem
                question="Já tenho ChatGPT Plus"
                answer="Legal. Agora pergunta pro ChatGPT o que ele acha da sua ideia de negócio e conta quantos "depende" e "existem múltiplas perspectivas" você recebe antes de uma resposta útil. Ah, e você paga R$100/mês por isso."
              />
              <FAQItem
                question="500 mensagens é pouco?"
                answer="Mensagens premium são pra tarefas pesadas. Pro dia a dia, o modelo Sage é ilimitado e resolve 80% do que você precisa. Se você realmente usa pesado, o Profissional tem 3.000."
              />
              <FAQItem
                question="IA sem censura é perigoso?"
                answer="Perigoso é adulto precisar de permissão pra acessar informação. Sage tem linhas vermelhas sensatas (nada de menor, nada de armas de destruição em massa, nada de incentivar suicídio). Fora isso, você é tratado como adulto."
              />
              <FAQItem
                question="Como sei que é bom?"
                answer="Você não sabe. Por isso tem garantia de 7 dias. Testa, usa, decide. Risco zero."
              />
              <FAQItem
                question="Posso cancelar?"
                answer="A qualquer momento. Sem multa. Sem fidelidade. Sem fazer você ligar pra um 0800."
              />
              <FAQItem
                question="Qual plano escolher?"
                answer="Se você usa IA ocasionalmente ou tá começando: Essencial. Se IA é parte do seu trabalho diário: Profissional. Simples."
              />
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AnimatedSection>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
              Você tem duas opções agora:
            </motion.h2>

            <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 gap-6 mb-12">
              <div className="glass rounded-2xl p-6 sm:p-8 text-left border border-white/10">
                <p className="text-lg font-semibold text-white/50 mb-4">Opção 1:</p>
                <p className="text-white/70">
                  Continuar usando IA que te trata como criança, pedindo desculpas toda vez que você faz uma pergunta interessante. Pagar R$100/mês no ChatGPT Plus pra receber &ldquo;não posso opinar sobre isso&rdquo;.
                </p>
              </div>

              <div className="glass rounded-2xl p-6 sm:p-8 text-left border-2 border-sage-500/50 bg-sage-500/5">
                <p className="text-lg font-semibold text-sage-400 mb-4">Opção 2:</p>
                <p className="text-white/90">
                  Assinar Sage IA por menos da metade do preço e finalmente ter uma ferramenta que trabalha PRA você, não CONTRA você. Com bônus que sozinhos valem mais que a assinatura.
                </p>
              </div>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-xl text-white/60 mb-10">
              A escolha é sua. Mas se você chegou até aqui, você já sabe qual faz sentido.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://payt.site/98C5azQ" className="btn-secondary text-lg py-4 px-8">
                Quero o Essencial — R$37/mês
              </a>
              <a href="https://payt.site/BvCG5DW" className="btn-primary text-lg py-4 px-8 inline-flex items-center justify-center gap-2">
                Quero o Profissional — R$97/mês <FiArrowRight />
              </a>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl">Sage IA</span>
          </div>
          <p className="text-white/50 text-lg mb-4">A IA sem hipocrisia.</p>
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Sage IA. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
    </main>
  );
}

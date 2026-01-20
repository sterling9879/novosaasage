import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sage IA - A IA Brasileira Sem Censura',
  description: 'A primeira inteligência artificial brasileira construída pra falar a verdade. Sem censura, sem frescura, sem te tratar como idiota.',
  keywords: 'IA, inteligência artificial, chatbot, Brasil, sem censura, GPT, Claude, copywriting',
  openGraph: {
    title: 'Sage IA - A IA Brasileira Que Fala O Que As Outras Têm Medo De Falar',
    description: 'Sem censura. Sem frescura. Sem te tratar como idiota. Respostas reais pra pessoas adultas.',
    type: 'website',
    locale: 'pt_BR',
  },
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <div className="animated-bg" />
        <div className="noise" />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
        {/* Vturb Video Preloads */}
        <link rel="preload" href="https://scripts.converteai.net/21b35875-8136-4b51-b275-3c04b6f8c5d5/players/69729e409380180051415508/v4/player.js" as="script" />
        <link rel="preload" href="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js" as="script" />
        <link rel="preload" href="https://cdn.converteai.net/21b35875-8136-4b51-b275-3c04b6f8c5d5/69729e3cf76c49143cccac0a/main.m3u8" as="fetch" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.converteai.net" />
        <link rel="dns-prefetch" href="https://scripts.converteai.net" />
        <link rel="dns-prefetch" href="https://images.converteai.net" />
        <link rel="dns-prefetch" href="https://api.vturb.com.br" />
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '737666816082504');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=737666816082504&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* Vturb Performance Script */}
        <Script id="vturb-perf" strategy="beforeInteractive">
          {`!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);`}
        </Script>
      </head>
      <body className="antialiased">
        <div className="animated-bg" />
        <div className="noise" />
        {children}
      </body>
    </html>
  );
}

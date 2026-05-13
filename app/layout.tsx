import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { AppStateProvider } from './lib/state';
import { ToastProvider } from './components/Toast';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Episign — Administration',
  description: "Interface d'administration Episign",
};

const isDev = process.env.NODE_ENV === 'development';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body>
        <AppStateProvider>
          <ToastProvider>
            {children}
            {isDev && <DevToolsLoader />}
          </ToastProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}

async function DevToolsLoader() {
  const { DevTools } = await import('./dev/DevTools');
  return <DevTools />;
}

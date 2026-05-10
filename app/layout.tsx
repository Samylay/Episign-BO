import './globals.css';
import type { Metadata } from 'next';
import { AppStateProvider } from './lib/state';
import { ToastProvider } from './components/Toast';
import { DevTools } from './dev/DevTools';

export const metadata: Metadata = {
  title: 'Episign — Administration',
  description: "Interface d'administration Episign",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppStateProvider>
          <ToastProvider>
            {children}
            <DevTools />
          </ToastProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}

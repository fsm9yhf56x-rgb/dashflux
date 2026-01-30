import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './mobile.css';
import { SettingsProvider } from '@/contexts/SettingsContext'; // ✅ AJOUTER

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DashFlux - Dashboard Multi-Assets',
  description: 'Dashboard de scoring multi-assets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} overflow-x-hidden`}>
        {/* ✅ WRAPPER AVEC SettingsProvider */}
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
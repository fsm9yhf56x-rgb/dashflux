import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DashFlux v2.1 - Multi-Asset Scoring',
  description: 'Système de scoring multi-assets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
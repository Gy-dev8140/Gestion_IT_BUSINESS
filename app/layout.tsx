import type {Metadata} from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'IT Business Manager',
  description: 'Gestion des demandes d\'intervention informatique',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr" className={`${inter.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

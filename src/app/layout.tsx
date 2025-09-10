import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SessionProvider from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Neighborly',
  description: 'Tu comunidad, conectada.',
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
    <body
      className={`${inter.className} flex min-h-screen flex-col bg-neutral-100`}
    >
    <SessionProvider>
      <Header />
      <main className="flex flex-grow items-center justify-center p-4">
        {children}
      </main>
      <Footer />
    </SessionProvider>
    </body>
    </html>
  );
}

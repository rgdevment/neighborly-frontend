import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import React from 'react';

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
    <body className={`${inter.className} flex min-h-screen flex-col`}>
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
    </body>
    </html>
  );
}

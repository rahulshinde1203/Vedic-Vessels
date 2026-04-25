import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Providers from './providers';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vedic Vessels | Sacred Ritual Items',
  description:
    'Handcrafted sacred vessels and ritual items for your spiritual practice. Authentic brass, copper, and silver products made in India.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="text-brand-charcoal font-sans antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1"><Providers>{children}</Providers></main>
        <Footer />
      </body>
    </html>
  );
}

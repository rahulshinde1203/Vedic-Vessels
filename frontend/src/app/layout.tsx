import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: { default: 'Vedic Vessels', template: '%s | Vedic Vessels' },
  description: 'Handcrafted copper, brass, and clay vessels rooted in Indian tradition. Premium quality, authentic craftsmanship.',
  keywords: ['copper vessels', 'brass items', 'clay pots', 'vedic', 'Indian traditional', 'handcrafted'],
  openGraph: {
    title: 'Vedic Vessels — Sacred Earthen & Brass Crafts',
    description: 'Premium handcrafted copper, brass, and clay vessels.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                borderRadius: '12px',
                border: '1px solid #faefd9',
                color: '#3a1705',
              },
              success: { iconTheme: { primary: '#b85e0a', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

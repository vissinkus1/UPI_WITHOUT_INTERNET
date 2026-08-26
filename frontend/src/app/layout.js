import { Inter, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'UPI Mesh — Offline Payments via Encrypted Mesh Network',
  description: 'Send money without internet. Encrypted payment packets hop device-to-device via Bluetooth mesh until a bridge node settles them on the backend. RSA-2048 + AES-256-GCM hybrid encryption.',
  keywords: 'UPI, offline payments, mesh network, encryption, RSA, AES-GCM, Spring Boot, Java, fintech',
  openGraph: {
    title: 'UPI Mesh — Offline Payments',
    description: 'Encrypted mesh-routed deferred settlement for UPI payments.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        <div className="mesh-bg" aria-hidden="true" />
        <Navbar />
        <main className="relative z-10 pt-16 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

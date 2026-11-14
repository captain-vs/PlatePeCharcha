import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer'; // Import our new client-side Footer[cite: 1]
import { Analytics } from "@vercel/analytics/next"
export const metadata: Metadata = {
  title: 'PlatePeCharcha | Smart Canteen Pre-Order & Token Management System',
  description:
    'Real-time 15-minute slot pre-ordering, digital tokens, and batch KDS for institutional canteens.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ea580c" />
        <link rel="manifest" href="/manifest.json" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Analytics />
        <Footer /> {/* Add global Footer at bottom */}
      </body>
    </html>
  );
}
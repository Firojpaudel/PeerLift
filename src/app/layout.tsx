import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import { HeartbeatProvider } from '@/components/providers/HeartbeatProvider';
import { Toaster } from 'sonner';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PeerLift',
  description: 'Trade skills. Grow together.',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/icon-light.png',
        href: '/icon-light.png',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/icon-dark.png',
        href: '/icon-dark.png',
      },
    ],
    apple: [
      {
        url: '/icon-dark.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${bricolage.variable} ${jetbrainsMono.variable} min-h-screen bg-bg-primary text-text-primary antialiased font-body transition-colors duration-300`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <HeartbeatProvider>{children}</HeartbeatProvider>
            <Toaster position="top-right" expand={false} richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

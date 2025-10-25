import './globals.css';

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from '@/components/ui/toaster';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/auth-context';

const satoshi = localFont({
  src: [
    {
      path: '../../public/fonts/satoshi/Satoshi-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SIMAS Saraswati',
    template: '%s | SIMAS Saraswati',
  },
  description:
    'Sistem Informasi Manajemen Absensi (SIMAS) untuk SMP Saraswati Denpasar.',
  metadataBase: new URL('http://localhost:3000'),
  keywords: [
    'Next.js',
    'React',
    'JavaScript',
    'TypeScript',
    'TailwindCSS',
    'Template',
    'Shadcn/UI',
    'Attendance',
    'School Management',
  ],
  authors: [{ name: 'SMP Saraswati Team' }],
  creator: 'SMP Saraswati Team',
  publisher: 'SMP Saraswati',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: '48x48' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon.ico' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: [{ url: '/favicon/favicon.ico' }],
  },
  openGraph: {
    title: 'SIMAS Saraswati',
    description:
      'Sistem Informasi Manajemen Absensi (SIMAS) untuk SMP Saraswati Denpasar.',
    siteName: 'SIMAS Saraswati',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SIMAS Saraswati',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIMAS Saraswati',
    description:
      'Sistem Informasi Manajemen Absensi (SIMAS) untuk SMP Saraswati Denpasar.',
    images: ['/og-image.jpg'],
    creator: '@omanjaya',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${satoshi.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <div className="h-screen bg-background text-foreground">
              {children}
              <Toaster />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
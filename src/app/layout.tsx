
import type { Metadata, Viewport } from 'next';
import { Noto_Sans, Merriweather, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { LanguageProvider } from '@/contexts/language-context';
import { BookmarkProvider } from '@/contexts/bookmark-context';
import Header from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { ClientOnly } from '@/components/client-only';
import { ServiceWorkerRegistrar } from '@/components/layout/service-worker-registrar'; // Import the new component

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
});

const merriweather = Merriweather({
  variable: '--font-merriweather',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'सारथी - तुमचा वैयक्तिक विकास सहकारी', 
  description: 'तुमच्या वैयक्तिक विकासाच्या प्रवासाला मार्गदर्शन करण्यासाठी बहुभाषिक पुस्तक सारांश आणि चिंतन सूचना.',
  manifest: '/manifest.json', // Added manifest link
};

export const viewport: Viewport = { // Added viewport for PWA theme color
  themeColor: '#FF8A00',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${notoSans.variable} ${inter.variable} ${merriweather.variable} font-body antialiased flex flex-col min-h-screen`}
      >
        <ServiceWorkerRegistrar /> {/* Add the registrar here */}
        <ClientOnly>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <BookmarkProvider>
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                  {children}
                </main>
                <Toaster />
              </BookmarkProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  );
}

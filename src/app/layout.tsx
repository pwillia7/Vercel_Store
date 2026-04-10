import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getStoreConfig } from '@/lib/api/client'
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';



const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

/**
 * Root metadata driven by the store config API.
 * getStoreConfig() is cached for weeks so this adds no meaningful latency.
 * Falls back to hardcoded values if the config fetch fails.
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig()

  const siteName = config?.storeName ?? 'Vercel Swag Store'
  const defaultTitle = config?.seo.defaultTitle ?? siteName
  const defaultDescription =
    config?.seo.defaultDescription ??
    'Premium merchandise for developers who ship. Official Vercel swag — hoodies, tees, gear, and more.'
  const titleTemplate = config?.seo.titleTemplate ?? `%s | ${siteName}`

  return {
    title: {
      default: defaultTitle,
      template: titleTemplate,
    },
    description: defaultDescription,
    keywords: ['vercel', 'swag', 'developer merchandise', 'tech gear', 'next.js'],
    authors: [{ name: 'Vercel' }],
    creator: 'Vercel',
    openGraph: {
      type: 'website',
      siteName,
      title: defaultTitle,
      description: defaultDescription,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDescription,
      ...(config?.socialLinks.twitter
        ? { site: config.socialLinks.twitter }
        : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

/** Inline script that runs before first paint to avoid flash of wrong theme */
const themeScript = `
(function(){
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e){}
})();
`.trim()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-black text-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

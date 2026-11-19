import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Onest } from 'next/font/google'
import { Shell } from '@/components/Shell'
import { THEME_COLORS, themeScript } from '@/lib/theme-script'
// Same order as the prototype: reset, tokens and chrome, then the parts, then later layers that refine them.
import '@/styles/reset.css'
import '@/styles/base.css'
import '@/styles/parts.css'
import '@/styles/pages.css'
import '@/styles/detail.css'
import '@/styles/flows.css'
import '@/styles/states.css'
import '@/styles/more.css'
import '@/styles/app.css'

// Display face: the prototype loads opsz 12..96, wdth 75..100, wght 200..800 (the full variable font).
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],
  variable: '--font-d',
  fallback: ['Trebuchet MS', 'system-ui', 'sans-serif'],
})

// Text face: variable weight (the prototype uses 400..700).
const text = Onest({
  subsets: ['latin'],
  variable: '--font-t',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
})

export const metadata: Metadata = {
  title: { default: 'Dan & Mah', template: '%s · Dan & Mah' },
  description: 'Os jogos que a gente jogou, está jogando e ainda quer jogar.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // The theme script sets data-b-theme before React hydrates, hence the suppressed warning on <html> only.
    <html lang="pt-BR" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="dir-b">
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}

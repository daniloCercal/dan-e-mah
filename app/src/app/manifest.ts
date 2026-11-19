import type { MetadataRoute } from 'next'
import { THEME_COLORS } from '@/lib/theme-script'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Dan & Mah',
    short_name: 'Dan & Mah',
    description: 'Os jogos que a gente jogou, está jogando e ainda quer jogar.',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: THEME_COLORS.light,
    theme_color: THEME_COLORS.light,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}

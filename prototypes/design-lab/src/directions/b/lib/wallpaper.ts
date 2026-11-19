import { useEffect, useSyncExternalStore } from 'react'
import type { PersonId } from '../../../data/games'
import { useTheme } from './theme'

/**
 * Wallpapers: quiet repeating drawings behind the pages. Each person picks their own, with an intensity.
 * Every wallpaper is a small SVG tile built from the theme's colours, so it works in light and dark.
 */
interface Colours {
  line: string
  d: string
  m: string
  both: string
}

export interface Wallpaper {
  id: string
  name: string
  /** One line describing it, for the picker. */
  about: string
  /** Tile width and height in CSS pixels. */
  size: [number, number]
  draw: (c: Colours) => string
}

export type Level = 'suave' | 'normal' | 'forte'
export const levels: { id: Level; label: string; opacity: number }[] = [
  { id: 'suave', label: 'Suave', opacity: 0.45 },
  { id: 'normal', label: 'Normal', opacity: 0.75 },
  { id: 'forte', label: 'Forte', opacity: 1 },
]

const dotted = `fill='none' stroke-width='2.6' stroke-linecap='round' stroke-dasharray='0.1 8'`
const thin = `fill='none' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'`
const sparkle = 'M0-9Q1.5-1.5 9 0Q1.5 1.5 0 9Q-1.5 1.5-9 0Q-1.5-1.5 0-9Z'
const star = '0,-8 2.3,-2.5 8,-2.5 3.4,1.2 5.1,7 0,3.6 -5.1,7 -3.4,1.2 -8,-2.5 -2.3,-2.5'
const skull = 'M0-14c9 0 14 6 14 12 0 5-3 8-7 9v4c0 1-1 2-3 2h-8c-2 0-3-1-3-2v-4c-4-1-7-4-7-9 0-6 5-12 14-12Z'
const heart = (x: number, y: number, u: number) =>
  [[1, 0, 2, 1], [4, 0, 2, 1], [0, 1, 7, 2], [1, 3, 5, 1], [2, 4, 3, 1], [3, 5, 1, 1]]
    .map(([px, py, w, h]) => `<rect x='${x + px * u}' y='${y + py * u}' width='${w * u}' height='${h * u}'/>`)
    .join('')

export const wallpapers: Wallpaper[] = [
  {
    id: 'formas', name: 'Formas pontilhadas', about: 'Círculos, cruz e quadrado em pontinhos.', size: [520, 520],
    draw: (c) =>
      `<g ${dotted}><g stroke='${c.line}'><circle cx='84' cy='96' r='34'/><circle cx='124' cy='96' r='34'/><rect x='356' y='300' width='62' height='62' rx='14' transform='rotate(12 387 331)'/><path d='M232 404v60M202 434h60'/></g><circle cx='410' cy='92' r='22' stroke='${c.d}' opacity='.6'/><path d='M150 262l26 46h-52z' stroke='${c.m}' opacity='.55'/><circle cx='300' cy='180' r='16' stroke='${c.both}' opacity='.7'/></g>`,
  },
  {
    id: 'circulos', name: 'Nós dois', about: 'Os dois círculos da marca, espalhados.', size: [240, 220],
    draw: (c) =>
      `<g ${thin}><g stroke='${c.line}'><circle cx='52' cy='58' r='26'/><circle cx='84' cy='58' r='26'/><circle cx='196' cy='110' r='12'/><circle cx='210' cy='110' r='12'/></g><circle cx='140' cy='168' r='18' stroke='${c.d}' opacity='.6'/><circle cx='162' cy='168' r='18' stroke='${c.m}' opacity='.6'/></g>`,
  },
  {
    id: 'pixels', name: 'Pixels', about: 'Corações e degraus de pixel.', size: [220, 200],
    draw: (c) =>
      `<g fill='${c.line}'><rect x='24' y='130' width='8' height='8'/><rect x='34' y='140' width='8' height='8'/><rect x='44' y='150' width='8' height='8'/><rect x='170' y='36' width='6' height='6'/><rect x='184' y='50' width='6' height='6'/><rect x='108' y='98' width='6' height='6'/></g><g fill='${c.m}' opacity='.55'>${heart(52, 40, 4)}</g><g fill='${c.d}' opacity='.5'>${heart(150, 132, 3)}</g>`,
  },
  {
    id: 'brilhos', name: 'Brilhos', about: 'Estrelas e brilhos, como no logo.', size: [260, 240],
    draw: (c) =>
      `<path d='${sparkle}' transform='translate(46 52) scale(1.5)' fill='${c.both}' opacity='.75'/><polygon points='${star}' transform='translate(170 40)' fill='${c.line}'/><path d='${sparkle}' transform='translate(212 132)' fill='${c.line}'/><polygon points='${star}' transform='translate(96 168) scale(1.3)' fill='${c.m}' opacity='.5'/><path d='${sparkle}' transform='translate(150 108) scale(.7)' fill='${c.d}' opacity='.55'/><polygon points='${star}' transform='translate(28 208) scale(.8)' fill='${c.line}'/>`,
  },
  {
    id: 'controles', name: 'Controles', about: 'Direcional e botões de controle.', size: [320, 280],
    draw: (c) =>
      `<g ${thin}><g stroke='${c.line}'><path d='M52 40h18v18h18v18H70v18H52V76H34V58h18z'/><rect x='196' y='168' width='74' height='44' rx='22'/><circle cx='214' cy='190' r='7'/><path d='M246 184v12M240 190h12'/><circle cx='120' cy='214' r='10'/><circle cx='148' cy='196' r='10'/></g><circle cx='236' cy='62' r='11' stroke='${c.both}' opacity='.8'/><circle cx='264' cy='44' r='11' stroke='${c.m}' opacity='.6'/><circle cx='264' cy='80' r='11' stroke='${c.d}' opacity='.6'/></g>`,
  },
  {
    id: 'pontos', name: 'Pontinhos', about: 'Uma grade regular de pontos.', size: [26, 26],
    draw: (c) => `<circle cx='13' cy='13' r='1.7' fill='${c.line}'/>`,
  },
  {
    id: 'quadriculado', name: 'Caderno quadriculado', about: 'Linhas finas de caderno.', size: [34, 34],
    draw: (c) => `<path d='M34 .5H.5V34' fill='none' stroke='${c.line}' stroke-width='1'/>`,
  },
  {
    id: 'ondas', name: 'Ondas', about: 'Linhas onduladas, bem calmas.', size: [120, 44],
    draw: (c) => `<path d='M0 22c20-16 40-16 60 0s40 16 60 0' ${thin} stroke='${c.line}'/>`,
  },
  {
    id: 'confete', name: 'Papel picado', about: 'Pedacinhos nas cores de vocês.', size: [260, 240],
    draw: (c) =>
      [[30, 40, 20, c.d], [110, 28, -30, c.both], [200, 60, 50, c.m], [70, 120, 70, c.both], [160, 140, -15, c.d], [226, 190, 35, c.line], [36, 200, -50, c.m], [128, 208, 10, c.line], [240, 118, 80, c.line]]
        .map(([x, y, r, col]) => `<rect x='${x}' y='${y}' width='12' height='7' rx='1.5' transform='rotate(${r} ${Number(x) + 6} ${Number(y) + 3.5})' fill='${col}' opacity='${col === c.line ? 1 : 0.6}'/>`)
        .join(''),
  },
  {
    id: 'caveirinhas', name: 'Caveirinhas', about: 'A caveirinha da testa da mascote.', size: [200, 190],
    draw: (c) => {
      const one = (x: number, y: number, s: number, col: string, o: number) =>
        `<g transform='translate(${x} ${y}) scale(${s})' opacity='${o}'><path d='${skull}' fill='none' stroke='${col}' stroke-width='${1.8 / s}'/><ellipse cx='-5' cy='-2' rx='2.6' ry='3.4' fill='${col}'/><ellipse cx='5' cy='-2' rx='2.6' ry='3.4' fill='${col}'/></g>`
      return one(48, 50, 1.3, c.line, 1) + one(150, 120, 1, c.m, 0.6) + one(96, 158, 0.75, c.line, 1) + one(168, 34, 0.7, c.line, 1)
    },
  },
  {
    id: 'diagonais', name: 'Listras', about: 'Listras finas na diagonal.', size: [22, 22],
    draw: (c) => `<path d='M-5.5 5.5l11-11M0 22L22 0M16.5 27.5l11-11' stroke='${c.line}' stroke-width='1.4'/>`,
  },
]

interface Choice {
  id: string
  level: Level
}
type Stored = Partial<Record<PersonId, Choice>>

const KEY = 'dan-mah:papel-de-parede'
const none: Choice = { id: 'liso', level: 'normal' }
const listeners = new Set<() => void>()

function read(): Stored {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Stored
  } catch {
    return {}
  }
}

let stored: Stored = read()

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function setWallpaper(person: PersonId, next: Partial<Choice>) {
  stored = { ...stored, [person]: { ...none, ...stored[person], ...next } }
  try {
    localStorage.setItem(KEY, JSON.stringify(stored))
  } catch {
    /* storage unavailable: the choice lasts for this visit only */
  }
  listeners.forEach((fn) => fn())
}

/** The CSS `background-image` value and tile size for a wallpaper, in the given theme. */
export function tile(id: string, level: Level, dark: boolean): { image: string; size: string } | null {
  const w = wallpapers.find((x) => x.id === id)
  if (!w) return null
  const c: Colours = dark
    ? { line: '#4D3F70', d: '#2A9AA5', m: '#E0457F', both: '#F2C14E' }
    : { line: '#BCB1D9', d: '#17666E', m: '#BF3468', both: '#DDA21A' }
  const opacity = levels.find((l) => l.id === level)?.opacity ?? 0.75
  const [width, height] = w.size
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><g opacity='${opacity}'>${w.draw(c)}</g></svg>`
  return { image: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, size: `${width}px ${height}px` }
}

export function useWallpaperChoice(person: PersonId): Choice {
  const all = useSyncExternalStore(subscribe, () => stored)
  return all[person] ?? none
}

/** Paints the viewer's wallpaper behind the pages. Call once, in the shell. */
export function useWallpaper(person: PersonId) {
  const { dark } = useTheme()
  const choice = useWallpaperChoice(person)
  useEffect(() => {
    const root = document.documentElement
    const t = tile(choice.id, choice.level, dark)
    if (t) {
      root.style.setProperty('--b-wall', t.image)
      root.style.setProperty('--b-wall-size', t.size)
    } else {
      root.style.removeProperty('--b-wall')
      root.style.removeProperty('--b-wall-size')
    }
    return () => {
      root.style.removeProperty('--b-wall')
      root.style.removeProperty('--b-wall-size')
    }
  }, [choice.id, choice.level, dark])
}

/** Store links, image downscaling and the one celebration burst. */
import { isCalm } from './profile'

const stores: [RegExp, string][] = [
  [/(^|\.)steampowered\.com$|(^|\.)steamcommunity\.com$/, 'Steam'],
  [/(^|\.)epicgames\.com$/, 'Epic Games'],
  [/(^|\.)gog\.com$/, 'GOG'],
  [/(^|\.)xbox\.com$/, 'Xbox'],
  [/(^|\.)playstation\.com$/, 'PlayStation'],
  [/(^|\.)nintendo\.(com|com\.br|pt|es)$/, 'Nintendo'],
  [/(^|\.)itch\.io$/, 'itch.io'],
]

export interface StoreLink { url: string; label: string; host: string }

/** Parses an address typed by a person. Returns undefined when it is not a usable web address. */
export function parseLink(raw: string): StoreLink | undefined {
  const text = raw.trim()
  if (!text || /\s/.test(text)) return undefined
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
  } catch {
    return undefined
  }
  if (!/^https?:$/.test(url.protocol) || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(url.hostname)) return undefined
  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  const label = stores.find(([re]) => re.test(host))?.[1] ?? 'Outra loja'
  return { url: url.toString(), label, host }
}

export function steamAppId(url: string): number | undefined {
  const m = /store\.steampowered\.com\/app\/(\d+)/i.exec(url)
  return m ? Number(m[1]) : undefined
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image failed to load'))
    img.src = src
  })
}

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('file could not be read'))
    reader.readAsDataURL(file)
  })
}

export interface Crop { zoom: number; x: number; y: number }

/**
 * Draws `img` covering a w×h box. `zoom` >= 1 enlarges; x and y (-1..1) move inside the slack.
 * Used for the square avatar (256) and for 2:3 covers.
 */
export function drawCover(canvas: HTMLCanvasElement, img: HTMLImageElement, w: number, h: number, crop: Crop = { zoom: 1, x: 0, y: 0 }) {
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * crop.zoom
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  const dx = (w - dw) / 2 - (crop.x * (dw - w)) / 2
  const dy = (h - dh) / 2 - (crop.y * (dh - h)) / 2
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, dx, dy, dw, dh)
}

export function toJpeg(img: HTMLImageElement, w: number, h: number, crop?: Crop): string {
  const canvas = document.createElement('canvas')
  drawCover(canvas, img, w, h, crop)
  return canvas.toDataURL('image/jpeg', 0.86)
}

/** One burst of paper in the two members' colours plus mustard; the canvas removes itself. */
export function burst(origin: Element | null) {
  if (!origin || isCalm()) return
  const cv = document.createElement('canvas')
  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  cv.width = w * dpr
  cv.height = h * dpr
  cv.setAttribute('aria-hidden', 'true')
  Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '80' })
  document.body.appendChild(cv)
  const ctx = cv.getContext('2d')
  if (!ctx) return cv.remove()
  ctx.scale(dpr, dpr)
  const box = origin.getBoundingClientRect()
  const ox = box.left + box.width / 2
  const oy = box.top + box.height / 2
  const colours = ['#17666e', '#bf3468', '#f2c14e', '#241a35']
  const bits = Array.from({ length: 70 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
    const v = 180 + Math.random() * 330
    return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 12, c: colours[i % 4] }
  })
  const t0 = performance.now()
  const life = 1.2
  const frame = (now: number) => {
    const t = (now - t0) / 1000
    ctx.clearRect(0, 0, w, h)
    if (t > life || !cv.isConnected) return cv.remove()
    for (const b of bits) {
      ctx.save()
      ctx.translate(ox + b.vx * t, oy + b.vy * t + 520 * t * t)
      ctx.rotate(b.r + b.vr * t)
      ctx.globalAlpha = Math.max(0, 1 - Math.pow(t / life, 3))
      ctx.fillStyle = b.c
      ctx.fillRect(-b.s / 2, -b.s / 3, b.s, b.s * 0.66)
      ctx.restore()
    }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

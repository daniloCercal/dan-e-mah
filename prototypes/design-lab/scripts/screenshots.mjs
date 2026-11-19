// Captures every prototype screen at mobile / tablet / desktop widths.
// Usage (dev server must be running):
//   node scripts/screenshots.mjs            -> all directions + design-lab
//   node scripts/screenshots.mjs a          -> only direction A
//   node scripts/screenshots.mjs a mobile   -> only direction A at 375px
// Env: BASE_URL (default http://localhost:5173), PLAYWRIGHT_BROWSERS_PATH, ENGINE=webkit|chromium
import { chromium, webkit } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.BASE_URL ?? 'http://localhost:5173'
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'artifacts', 'screenshots')
const [only, onlySize] = process.argv.slice(2)

const sizes = {
  mobile: { width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
}

const screens = [
  ['inicio', ''],
  ['biblioteca', 'biblioteca'],
  ['biblioteca-lista', 'biblioteca?ver=lista'],
  ['filtros-ativos', 'biblioteca?genero=Terror&modo=Co-op%20online'],
  ['filtros-vazio', 'biblioteca?genero=Estrat%C3%A9gia&humor=Para%20tomar%20susto'],
  ['jogo', 'jogo/it-takes-two'],
  ['jogo-divergente', 'jogo/cuphead'],
  ['adicionar', 'adicionar'],
  ['estilo', 'estilo'],
]

const engine = process.env.ENGINE === 'webkit' ? webkit : chromium
const browser = await engine.launch()
const directions = only && only !== 'lab' ? [only] : only === 'lab' ? [] : ['a', 'b', 'c']
let failures = 0

for (const [sizeName, size] of Object.entries(sizes)) {
  if (onlySize && onlySize !== sizeName) continue
  const { width, height, ...rest } = size
  const ctx = await browser.newContext({ viewport: { width, height }, ...rest, locale: 'pt-BR', reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => { failures++; console.error(`  page error: ${e.message}`) })

  const shots = directions.flatMap((d) => screens.map(([name, path]) => [`${d}/${name}-${sizeName}`, `/${d}/${path}`]))
  if (!only || only === 'lab') shots.push([`design-lab-${sizeName}`, '/design-lab'])

  for (const [file, path] of shots) {
    const dest = join(root, `${file}.png`)
    await mkdir(dirname(dest), { recursive: true })
    try {
      await page.goto(base + path, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(350)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      if (overflow > 1) { failures++; console.error(`  horizontal overflow of ${overflow}px on ${path} (${sizeName})`) }
      await page.screenshot({ path: dest, fullPage: true })
      console.log('ok', file)
    } catch (e) {
      failures++
      console.error('FAILED', file, e.message)
    }
  }
  await ctx.close()
}

await browser.close()
if (failures) { console.error(`${failures} problem(s)`); process.exit(1) }

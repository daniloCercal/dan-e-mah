// Renders the PNG icons from public/favicon.svg, plus a preview sheet to judge the small sizes.
// Usage: node scripts/make-icons.mjs   (PLAYWRIGHT_BROWSERS_PATH must point at the installed browsers)
import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const svg = (await readFile(join(pub, 'favicon.svg'), 'utf8')).replace('<svg ', '<svg style="width:100%;height:100%;display:block" ')

// [file, size in px, padding as a fraction of the size, background]
const icons = [
  ['apple-touch-icon.png', 180, 0.12, '#EFECF7'],
  ['icon-192.png', 192, 0.12, '#EFECF7'],
  ['icon-512.png', 512, 0.12, '#EFECF7'],
  ['favicon-32.png', 32, 0, 'transparent'],
  ['favicon-16.png', 16, 0, 'transparent'],
]

const browser = await chromium.launch()
for (const [file, size, pad, bg] of icons) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  const inner = size * (1 - 2 * pad)
  await page.setContent(
    `<body style="margin:0;width:${size}px;height:${size}px;background:${bg};display:grid;place-items:center"><div style="width:${inner}px;height:${inner}px">${svg}</div></body>`,
  )
  await page.screenshot({ path: join(pub, file), omitBackground: bg === 'transparent' })
  await page.close()
}

const data = async (file) => 'data:image/png;base64,' + (await readFile(join(pub, file))).toString('base64')
const cells = []
for (const [file, size, zoom] of [['favicon-16.png', 16, 6], ['favicon-32.png', 32, 4], ['apple-touch-icon.png', 180, 1]]) {
  cells.push(
    `<div><img src="${await data(file)}" style="width:${size * zoom}px;image-rendering:pixelated;display:block"><p>${size} px${zoom > 1 ? ` (ampliado ${zoom}x)` : ''}</p></div>`,
  )
}
const page = await browser.newPage({ viewport: { width: 560, height: 240 } })
await page.setContent(`<body style="margin:0;padding:20px;display:flex;gap:28px;align-items:end;background:#fff;font:12px system-ui">${cells.join('')}</body>`)
await page.screenshot({ path: join(root, '..', '..', 'artifacts', 'design', 'favicon-conferencia.png') })
await browser.close()
console.log('icons ok')

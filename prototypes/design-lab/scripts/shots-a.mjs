// Interactive states of direction A that scripts/screenshots.mjs does not reach.
// Usage (dev server running): node scripts/shots-a.mjs [mobile|desktop]
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.BASE_URL ?? 'http://localhost:5173'
const out = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'artifacts', 'screenshots', 'a')
const only = process.argv[2]

const sizes = {
  mobile: { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
}

await mkdir(out, { recursive: true })
const browser = await chromium.launch()
let failures = 0

for (const [size, options] of Object.entries(sizes)) {
  if (only && only !== size) continue
  const ctx = await browser.newContext({ ...options, locale: 'pt-BR', reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => { failures++; console.error(`  page error: ${e.message}`) })

  const open = async (path) => {
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
  }
  const shot = async (name, fullPage = false) => {
    await page.waitForTimeout(400)
    await page.screenshot({ path: join(out, `${name}-${size}.png`), fullPage })
    console.log('ok', `${name}-${size}`)
  }
  const step = async (name, run) => {
    try { await run() } catch (e) { failures++; console.error('FAILED', name, size, e.message.split('\n')[0]) }
  }

  await step('inicio-dobra', async () => {
    await open('/a/')
    await shot('inicio-dobra')
  })

  await step('filtros-abertos', async () => {
    await open('/a/biblioteca?genero=Terror')
    await page.getByRole('button', { name: /Filtros/ }).click()
    await shot('filtros-abertos')
    await page.keyboard.press('Escape')
    const back = await page.evaluate(() => document.activeElement?.textContent ?? '')
    if (!back.includes('Filtros')) { failures++; console.error('  focus did not return to the filter button') }
  })

  await step('adicionar', async () => {
    await open('/a/adicionar')
    await page.getByRole('searchbox').fill('it')
    await page.waitForTimeout(450)
    await shot('adicionar-resultados', true)
    await page.getByRole('searchbox').fill('zzzz')
    await page.waitForTimeout(450)
    await shot('adicionar-sem-resultado', true)
    await page.getByRole('searchbox').fill('cel')
    await page.waitForTimeout(450)
    await page.getByRole('button', { name: /Escolher Celeste/ }).click()
    await shot('adicionar-confirmar', true)
    await page.getByRole('button', { name: 'Salvar na biblioteca' }).click()
    await shot('adicionar-salvo', true)
  })

  await step('sortear', async () => {
    await open('/a/sortear')
    await shot('sortear', true)
    await page.getByRole('button', { name: 'Sortear', exact: true }).click()
    await shot('sortear-resultado')
    await page.getByRole('button', { name: 'É esse' }).click()
    await shot('sortear-escolhido')
  })

  await step('avaliar', async () => {
    await open('/a/jogo/split-fiction')
    await page.getByRole('button', { name: 'Dar minha nota' }).click()
    await page.waitForTimeout(200)
    await shot('avaliar')
    await page.getByRole('button', { name: 'Salvar nota' }).click()
    await shot('avaliar-salvo', true)
  })

  await step('diario-nos', async () => {
    await open('/a/diario')
    await shot('diario', true)
    await open('/a/nos')
    await shot('nos', true)
  })

  await ctx.close()
}

// The reveal with motion enabled: one frame mid-sequence, to check the staging.
if (!only || only === 'mobile') {
  const ctx = await browser.newContext({ ...sizes.mobile, locale: 'pt-BR' })
  const page = await ctx.newPage()
  try {
    await page.goto(`${base}/a/sortear`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Sortear', exact: true }).click()
    await page.waitForTimeout(430)
    await page.screenshot({ path: join(out, 'sortear-revelando-mobile.png') })
    console.log('ok sortear-revelando-mobile')
  } catch (e) { failures++; console.error('FAILED reveal frame', e.message.split('\n')[0]) }
  await ctx.close()
}

await browser.close()
if (failures) { console.error(`${failures} problem(s)`); process.exit(1) }

// Interactive states of direction C that scripts/screenshots.mjs does not reach.
// Usage (dev server running): node scripts/shots-c.mjs
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.BASE_URL ?? 'http://localhost:5173'
const out = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'artifacts', 'screenshots', 'c')
await mkdir(out, { recursive: true })

const browser = await chromium.launch()
let problems = 0

async function run(name, size, fn, { motion = false, full = false } = {}) {
  const mobile = size === 'mobile'
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 375, height: 812 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, locale: 'pt-BR',
    reducedMotion: motion ? 'no-preference' : 'reduce',
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => { problems++; console.error(`  page error (${name}): ${e.message}`) })
  const shot = async (suffix = '') => {
    await page.waitForTimeout(350)
    await page.screenshot({ path: join(out, `${name}${suffix}-${size}.png`), fullPage: full })
    console.log('ok', `${name}${suffix}-${size}`)
  }
  const go = async (path) => {
    await page.goto(`${base}/c/${path}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
  }
  try {
    await fn(page, go, shot)
  } catch (e) {
    problems++
    console.error('FAILED', name, size, e.message)
  }
  await ctx.close()
}

for (const size of ['mobile', 'desktop']) {
  await run('filtros-abertos', size, async (page, go, shot) => {
    await go('biblioteca')
    await page.getByRole('button', { name: /Filtros/ }).click()
    await page.getByRole('button', { name: 'Para tomar susto' }).click()
    await page.getByRole('button', { name: 'Co-op online' }).click()
    await shot()
    await page.keyboard.press('Escape')
    const back = await page.evaluate(() => document.activeElement?.textContent ?? '')
    if (!back.includes('Filtros')) { problems++; console.error('  focus did not return to the filter trigger:', back) }
  })

  await run('sortear', size, async (page, go, shot) => {
    await go('sortear')
    await shot()
    await page.getByRole('button', { name: 'Recortar o baralho' }).click()
    await shot('-recortes')
  })

  await run('sortear-resultado', size, async (page, go, shot) => {
    await go('sortear')
    await page.getByRole('button', { name: 'Sortear', exact: true }).click()
    await shot()
    await page.getByRole('button', { name: 'É esse' }).click()
    await shot('-escolhido')
  })

  // Real motion: hold the token, release, catch the reveal mid-air, then the settled result.
  await run('sortear-animacao', size, async (page, go, shot) => {
    await go('sortear')
    const box = await page.getByRole('button', { name: 'Sortear', exact: true }).boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(900)
    await page.screenshot({ path: join(out, `sortear-segurando-${size}.png`) })
    await page.mouse.up()
    await page.waitForTimeout(330)
    await page.screenshot({ path: join(out, `sortear-voando-${size}.png`) })
    await page.waitForTimeout(2200)
    await page.screenshot({ path: join(out, `sortear-pousou-${size}.png`) })
    if (!(await page.getByRole('button', { name: 'É esse' }).isVisible())) { problems++; console.error('  result actions missing after hold') }
    console.log('ok sortear-animacao', size)
  }, { motion: true })
}

// Keyboard activation of the token must also draw.
await run('sortear-teclado', 'desktop', async (page, go) => {
  await go('sortear')
  await page.getByRole('button', { name: 'Sortear', exact: true }).focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1400)
  if (!(await page.getByRole('button', { name: 'É esse' }).isVisible())) { problems++; console.error('  keyboard draw failed') }
  else console.log('ok keyboard draw')
}, { motion: true })

await run('adicionar-resultados', 'mobile', async (page, go, shot) => {
  await go('adicionar')
  await page.getByLabel('Nome do jogo').fill('it')
  await page.waitForTimeout(400)
  await shot()
  await page.getByLabel('Nome do jogo').fill('zzzz')
  await page.waitForTimeout(400)
  await shot('-vazio')
  await page.getByLabel('Nome do jogo').fill('cel')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /Celeste/ }).click()
  await shot('-confirmar')
  await page.getByRole('button', { name: 'Salvar na biblioteca' }).click()
  await shot('-salvo')
}, { full: true })

await run('adicionar-manual', 'mobile', async (page, go, shot) => {
  await go('adicionar')
  await page.getByRole('button', { name: /cadastrar manualmente/ }).click()
  await page.getByLabel('Título').fill('Jogo de tabuleiro da vó')
  await shot()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await shot('-confirmar')
}, { full: true })

await run('avaliar', 'mobile', async (page, go, shot) => {
  await go('jogo/valheim?avaliar=1')
  await shot()
  await page.getByRole('button', { name: 'Meio ponto a mais' }).click()
  await page.getByRole('button', { name: 'Salvar nota' }).click()
  await shot('-salvo')
})

await run('jogo-sem-notas', 'mobile', async (page, go, shot) => { await go('jogo/split-fiction'); await shot() }, { full: true })
await run('jogo-sessao', 'mobile', async (page, go, shot) => {
  await go('jogo/phasmophobia')
  await page.getByRole('button', { name: 'Registrar sessão' }).first().click()
  await page.waitForTimeout(500)
  await shot()
})
await run('carta-verso', 'mobile', async (page, go, shot) => {
  await go('biblioteca?ordem=nota')
  await page.getByRole('button', { name: /Virar a carta/ }).first().click()
  await page.getByRole('button', { name: /Virar a carta/ }).nth(1).click()
  await shot()
})
for (const size of ['mobile', 'desktop']) {
  await run('diario', size, async (page, go, shot) => { await go('diario'); await shot() }, { full: true })
  await run('nos', size, async (page, go, shot) => { await go('nos'); await shot() }, { full: true })
}
await run('inicio-dobra', 'mobile', async (page, go, shot) => { await go(''); await shot() })

await browser.close()
if (problems) { console.error(`${problems} problem(s)`); process.exit(1) }

import AxeBuilder from '@axe-core/playwright'
import { memberContext, pagesToVisit, resetPrefs, expect, test } from './support'

// Accessibility (axe, WCAG 2 A and AA) and screenshots at phone, tablet and desktop widths, light and dark.
const WIDTHS = [375, 768, 1440]
const THEMES = ['light', 'dark'] as const

test.beforeAll(async () => {
  await resetPrefs('dan')
})

for (const theme of THEMES) {
  test(`telas principais, tema ${theme}: axe, sem rolagem lateral e capturas`, async ({ browser, baseURL }) => {
    test.setTimeout(300_000)
    const paths = await pagesToVisit()
    const problems: string[] = []
    for (const width of WIDTHS) {
      const ctx = await memberContext(browser, 'dan', baseURL!, { viewport: { width, height: 900 }, colorScheme: theme })
      const page = await ctx.newPage()
      for (const path of paths) {
        await page.goto(path, { waitUntil: 'networkidle' })
        await page.waitForTimeout(400)
        const name = (path === '/' ? 'inicio' : path.slice(1).replace(/\//g, '-')) + `-${width}-${theme}`
        await page.screenshot({ path: `test-results/screens/${name}.png`, fullPage: true })
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        if (overflow > 0) problems.push(`${path} @${width} ${theme}: rolagem lateral de ${overflow}px`)
        if (width === 375) {
          const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
          for (const v of result.violations) problems.push(`${path} ${theme}: ${v.id} (${v.impact}) em ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)
        }
      }
      await ctx.close()
    }
    expect(problems).toEqual([])
  })
}

test('porta de entrada: axe nos dois temas', async ({ browser, baseURL }) => {
  const problems: string[] = []
  for (const theme of THEMES) {
    const ctx = await browser.newContext({ baseURL, viewport: { width: 375, height: 800 }, colorScheme: theme })
    const page = await ctx.newPage()
    await page.goto('/entrar', { waitUntil: 'networkidle' })
    await page.screenshot({ path: `test-results/screens/entrar-375-${theme}.png`, fullPage: true })
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    for (const v of result.violations) problems.push(`/entrar ${theme}: ${v.id} em ${v.nodes[0]?.target.join(' ')}`)
    await ctx.close()
  }
  expect(problems).toEqual([])
})

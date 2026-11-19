import { expect, memberContext, resetPrefs, test } from './support'

const record = () => {
  const w = window as unknown as { __anims: string[] }
  w.__anims = []
  document.addEventListener('animationstart', (e) => {
    const anc = (e.target as Element).closest('[class*="a-"]')
    const m = anc && [...anc.classList].find((c) => /^a-(appear|float|giggle|cheer|peek|load|startle)$/.test(c))
    if (m) w.__anims.push(m)
  }, true)
}

test.beforeAll(async () => {
  await resetPrefs('dan')
})

test('mascote: o movimento de Nós toca uma vez e some com a chave de animações', async ({ dan }) => {
  await dan.addInitScript(record)
  await dan.goto('/nos', { waitUntil: 'networkidle' })
  await dan.waitForTimeout(1500)
  const played = await dan.evaluate(() => (window as unknown as { __anims: string[] }).__anims.filter((a) => a === 'a-float'))
  expect(played.length).toBeGreaterThan(0)
  expect(await dan.locator('.title-row .moment .mascot').innerHTML()).toBe(await dan.locator('.brand .mascot').innerHTML())

  await dan.getByLabel('Animações decorativas').click({ force: true })
  await expect(dan.locator('html')).toHaveAttribute('data-calm', '')
  await dan.waitForTimeout(1500)
  await dan.reload({ waitUntil: 'networkidle' })
  await expect(dan.locator('html')).toHaveAttribute('data-calm', '')
  await expect(dan.locator('.title-row .moment.a-float')).toHaveCount(0)
  await dan.getByLabel('Animações decorativas').click({ force: true })
  await expect(dan.locator('html')).not.toHaveAttribute('data-calm', '')
  await resetPrefs('dan')
})

test('mascote: nada toca com o movimento reduzido do aparelho', async ({ browser, baseURL }) => {
  const ctx = await memberContext(browser, 'dan', baseURL!, { reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.addInitScript(record)
  await page.goto('/nos', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  expect(await page.evaluate(() => (window as unknown as { __anims: string[] }).__anims)).toEqual([])
  await ctx.close()
})

test('perfil do outro sócio é só leitura e o próprio perfil redireciona', async ({ dan }) => {
  await dan.goto('/nos')
  await dan.locator('a.member[href="/perfil/maellen"]').click()
  await expect(dan).toHaveURL(/\/perfil\/maellen$/)
  await expect(dan.getByRole('heading', { name: /Perfil de/ })).toBeVisible()
  await expect(dan.locator('form')).toHaveCount(0)
  await dan.goto('/perfil/danilo')
  await expect(dan).toHaveURL(/\/perfil$/)
  await dan.goto('/perfil/qualquer')
  await expect(dan.getByRole('heading', { name: 'Essa página não existe' })).toBeVisible()
})

test('conta que não é sócia cai em /sem-acesso', async ({ page }) => {
  await page.goto('/entrar?erro=1')
  await expect(page).toHaveURL(/\/sem-acesso$/)
  await expect(page.getByRole('heading', { name: 'Esta conta não faz parte do clube' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sair e tentar com outra conta' })).toHaveAttribute('href', '/entrar')
})

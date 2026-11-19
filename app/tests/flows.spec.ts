import { api, expect, resetPrefs, test } from './support'

test.beforeAll(async () => {
  await resetPrefs('dan')
  await resetPrefs('mah')
})

test('perfil: nome, tema e papel de parede ficam na conta', async ({ dan, mah }) => {
  await dan.goto('/perfil')
  const original = await dan.locator('#p-nome').inputValue()
  await dan.fill('#p-nome', 'Danilo E2E')
  await dan.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(dan.getByText('Perfil salvo.')).toBeVisible()

  await mah.goto('/nos')
  await expect(mah.locator('.members')).toContainText('Danilo E2E')

  await dan.locator('label', { hasText: /^Escuro$/ }).click()
  await dan.locator('label.wall-opt', { hasText: 'Brilhos' }).click()
  await dan.waitForTimeout(1500)
  await dan.reload()
  await expect(dan.locator('html')).toHaveAttribute('data-b-theme', 'dark')
  expect(await dan.evaluate(() => getComputedStyle(document.body).backgroundImage)).toContain('svg')

  await dan.fill('#p-nome', original)
  await dan.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(dan.getByText('Perfil salvo.')).toBeVisible()
  await resetPrefs('dan')
})

test('perfil: a foto aparece para o outro sócio', async ({ dan, mah }) => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64')
  await dan.goto('/perfil')
  await dan.setInputFiles('input[type=file]', { name: 'foto.png', mimeType: 'image/png', buffer: png })
  await expect(dan.locator('.photo-canvas')).toBeVisible()
  await dan.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(dan.getByText('Perfil salvo.')).toBeVisible()
  await mah.goto('/nos')
  await expect(mah.locator('.members img')).toHaveCount(1)
  await dan.getByRole('button', { name: 'Remover foto' }).click()
  await dan.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(dan.getByText('Perfil salvo.')).toBeVisible()
})

test('jogo e sessão: o que um registra o outro vê, e tudo entra na exportação', async ({ dan, mah }) => {
  const title = `E2E ${Date.now()}`
  const db = await api('dan')
  try {
    await dan.goto('/adicionar?manual=1')
    await dan.getByLabel('Título').fill(title)
    await dan.getByRole('button', { name: 'Continuar' }).click()
    await dan.getByRole('button', { name: 'Salvar na biblioteca' }).click()
    await dan.getByRole('link', { name: 'Abrir o jogo' }).click()
    await expect(dan.getByRole('heading', { level: 1, name: title })).toBeVisible({ timeout: 20_000 })

    await dan.getByRole('button', { name: 'Registrar sessão' }).click()
    await dan.getByRole('button', { name: '2 h', exact: true }).click()
    await dan.getByLabel(/Como foi/).fill('Sessão de teste')
    await dan.getByRole('button', { name: 'Guardar sessão' }).click()
    await expect(dan.locator('.o-sessions .note-text')).toHaveText('Sessão de teste')

    await mah.goto('/diario')
    await expect(mah.getByText('Sessão de teste')).toBeVisible()

    const res = await dan.request.get('/api/exportar?formato=json')
    expect(res.headers()['content-disposition']).toContain('attachment')
    const all = await res.json()
    expect(all.games.some((g: { title: string }) => g.title === title)).toBe(true)
    expect(all.play_sessions.some((s: { note: string }) => s.note === 'Sessão de teste')).toBe(true)
    const csv = await (await dan.request.get('/api/exportar?formato=jogos')).text()
    expect(csv).toContain(title)
  } finally {
    await db.from('games').delete().eq('title', title)
  }
})

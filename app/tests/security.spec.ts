import { test, expect } from '@playwright/test'

test.describe('visitante', () => {
  for (const path of ['/', '/biblioteca', '/diario', '/nos', '/perfil', '/adicionar', '/sortear', '/jogo/1']) {
    test(`${path} manda para a porta de entrada`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/entrar$/)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    })
  }

  test('exportar e busca exigem login', async ({ request }) => {
    for (const path of ['/api/exportar?formato=json', '/api/igdb/search?q=zelda']) {
      const res = await request.get(path, { maxRedirects: 0 })
      expect([307, 308, 401]).toContain(res.status())
    }
  })

  test('tarefa diária recusa quem não tem o segredo', async ({ request }) => {
    expect((await request.get('/api/cron/keepalive')).status()).toBe(401)
    expect((await request.get('/api/cron/keepalive', { headers: { authorization: 'Bearer errado' } })).status()).toBe(401)
  })

  test('retorno do login não redireciona para fora', async ({ request, baseURL }) => {
    for (const q of ['code=invalido&next=https://example.org', 'next=//example.org', 'redirect_to=https://example.org']) {
      const res = await request.get(`/auth/callback?${q}`, { maxRedirects: 0 })
      expect(res.status()).toBe(307)
      expect(new URL(res.headers().location, baseURL!).origin).toBe(new URL(baseURL!).origin)
    }
  })

  test('cabeçalhos de segurança e nada de segredo no HTML', async ({ request }) => {
    const res = await request.get('/entrar')
    const h = res.headers()
    expect(h['x-content-type-options']).toBe('nosniff')
    expect(h['x-frame-options']).toBe('DENY')
    expect(h['referrer-policy']).toBeTruthy()
    expect(h['x-powered-by']).toBeUndefined()
    const html = await res.text()
    expect(html).not.toMatch(/TWITCH_CLIENT_SECRET|CRON_SECRET|service_role|sb_secret_/)
  })

  test('manifesto e ícones', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest')
    expect(res.ok()).toBe(true)
    const m = await res.json()
    expect(m.display).toBe('standalone')
    expect(m.icons.some((i: { purpose: string }) => i.purpose === 'maskable')).toBe(true)
    for (const icon of m.icons as { src: string }[]) expect((await request.get(icon.src)).ok()).toBe(true)
  })
})

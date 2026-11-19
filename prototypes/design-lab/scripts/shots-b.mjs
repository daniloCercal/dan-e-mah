// Interactive, waiting and failure states of direction B that scripts/screenshots.mjs does not reach.
// Usage (dev server running): node scripts/shots-b.mjs [mobile|desktop|all] [flows|states|round3|escuro]
// Deterministic timing comes from the prototype's own query overrides: ?lento=0 (instant), ?lento=1 (slow), ?falha=1.
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.BASE_URL ?? 'http://localhost:5173'
const out = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'artifacts', 'screenshots', 'b')
const [only, part] = process.argv.slice(2)
await mkdir(out, { recursive: true })

const sizes = {
  mobile: { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
}

const browser = await chromium.launch()
let problems = 0
const fail = (msg) => { problems++; console.error('  ' + msg) }

for (const [name, size] of Object.entries(sizes)) {
  if (only && only !== 'all' && only !== name) continue
  const ctx = await browser.newContext({ ...size, locale: 'pt-BR' })
  const page = await ctx.newPage()
  let expectError = false
  page.on('pageerror', (e) => { if (!expectError) fail(`page error: ${e.message}`) })

  const url = (path, query) => base + path + (path.includes('?') ? '&' : '?') + query
  // Settled page, no simulated wait.
  const go = async (path, query = 'lento=0') => {
    await page.goto(url(path, query), { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
  }
  // Slow profile: stop as soon as the app has painted, so the waiting state is still on screen.
  const goSlow = async (path, query = 'lento=1') => {
    await page.goto(url(path, query), { waitUntil: 'load' })
    await page.waitForSelector('.dir-b .page, .dir-b .door')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(450)
  }
  const shot = async (file, fullPage = false) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 1) fail(`horizontal overflow of ${overflow}px in ${file}`)
    await page.screenshot({ path: join(out, `${file}-${name}.png`), fullPage })
    console.log('ok', `${file}-${name}`)
  }

  if (!part || part === 'flows') {
    await go('/b/')
    await shot('inicio-primeira-tela')

    await go('/b/biblioteca')
    await page.getByRole('button', { name: /Filtros/ }).click()
    await page.getByRole('button', { name: 'Para rir' }).click()
    await page.getByRole('button', { name: 'Co-op local' }).click()
    await page.waitForTimeout(450)
    await shot('filtros-abertos')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    if (await page.locator('.fpanel').count()) fail('filter panel still mounted after Escape')
    const focusBack = await page.evaluate(() => document.activeElement?.textContent ?? '')
    if (!focusBack.includes('Filtros')) fail(`focus did not return to the filter trigger: ${focusBack}`)

    // Cover -> game page -> back, through the shared-element transition when the engine supports it.
    await go('/b/biblioteca')
    await page.locator('.gcard').first().click()
    await page.waitForURL(/\/b\/jogo\//)
    await page.waitForTimeout(600)
    await shot('capa-para-jogo')
    await page.getByRole('button', { name: 'Voltar' }).click()
    await page.waitForURL(/\/b\/biblioteca/)
    await page.waitForTimeout(600)
    if (!(await page.locator('.gcard').count())) fail('library did not come back after Voltar')

    await go('/b/adicionar')
    await page.getByRole('searchbox').fill('it')
    await page.waitForTimeout(500)
    await shot('adicionar-resultados', true)
    await page.getByRole('searchbox').fill('cel')
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /Celeste/ }).click()
    await page.waitForTimeout(300)
    await shot('adicionar-confirmar', true)
    await page.getByRole('button', { name: 'Quero jogar' }).click()
    await page.getByRole('button', { name: 'Salvar na biblioteca' }).click()
    await page.waitForTimeout(500)
    await shot('adicionar-salvo', true)

    await go('/b/adicionar')
    await page.getByRole('searchbox').fill('zzzz')
    await page.waitForTimeout(500)
    await shot('adicionar-sem-resultado', true)
    await page.getByRole('button', { name: 'Cadastrar manualmente' }).click()
    await page.getByLabel('Título').fill('Jogo de tabuleiro da vó')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.waitForTimeout(300)
    await shot('adicionar-manual-confirmar', true)

    await go('/b/sortear')
    await shot('sortear-inicio', true)
    await page.getByRole('button', { name: /Sortear entre/ }).click()
    await page.waitForTimeout(260)
    await shot('sortear-no-meio')
    await page.waitForTimeout(2400)
    await shot('sortear-resultado', true)
    await page.getByRole('button', { name: 'É esse' }).click()
    await page.waitForTimeout(200)
    await shot('sortear-escolhido')

    await go('/b/jogo/cuphead?avaliar=1')
    await page.locator('.editor').scrollIntoViewIfNeeded()
    await shot('avaliar')
    await page.locator('#nota').fill('5')
    await page.getByRole('button', { name: 'Guardar nota' }).click()
    await page.waitForTimeout(700)
    await page.locator('#notas').scrollIntoViewIfNeeded()
    await shot('avaliar-salvo')

    await go('/b/jogo/split-fiction')
    await page.getByRole('button', { name: 'Carimbar: zerei' }).click()
    await page.waitForTimeout(500)
    await page.locator('.stampcard').scrollIntoViewIfNeeded()
    await shot('carimbo')
    await page.getByRole('button', { name: /Registrar sessão/ }).click()
    await page.waitForTimeout(200)
    await page.locator('.editor').scrollIntoViewIfNeeded()
    await shot('registrar-sessao')

    await go('/b/diario')
    await shot('diario', true)
    await go('/b/nos')
    await shot('nos', true)
  }

  if (!part || part === 'round3') {
    const photo = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'covers', '413150-cover.jpg')
    const both = name === 'desktop'
    const setStored = (key, value) => page.evaluate(([k, v]) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v) } catch { /* ignore */ } }, [key, value])

    // Profile: choose a photo, position it, save. The photo then shows up across the app.
    await go('/b/perfil')
    await shot('perfil-sem-foto')
    await page.locator('.profile-form input[type=file]').setInputFiles(photo)
    await page.waitForSelector('.photo-canvas')
    await page.locator('#zoom').fill('1.6')
    await page.locator('.photo-canvas').focus()
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(200)
    await shot('perfil-ajustar-foto', true)
    await page.getByRole('button', { name: 'Salvar perfil' }).click()
    await page.waitForTimeout(500)
    await shot('perfil-salvo', true)
    await go('/b/')
    await shot('inicio-com-foto', true)
    await go('/b/jogo/cuphead')
    await shot('jogo-com-foto', true)
    await go('/b/diario')
    await shot('diario-com-foto')
    await go('/b/perfil/maellen')
    await shot('perfil-do-outro')

    // Nós, with the marker highlight; zoomed crop of the numbers.
    await go('/b/nos')
    await shot('nos', true)
    await page.locator('.facts').screenshot({ path: join(out, `nos-marca-texto-${name}.png`) })
    console.log('ok', `nos-marca-texto-${name}`)
    // The highlighter stroke caught while it is being drawn. The real stroke lasts 420 ms; for the capture only,
    // a separate page stretches it to 4 s so the frame is taken at a known point of the same animation.
    {
      const slow = await ctx.newPage()
      await slow.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
          const st = document.createElement('style')
          st.textContent = '.dir-b .marker--draw::before { animation-duration: 4s !important; }'
          document.head.appendChild(st)
        })
      })
      await slow.goto(url('/b/nos', 'lento=0'), { waitUntil: 'load' })
      await slow.waitForSelector('.marker--draw')
      await slow.evaluate(() => document.fonts.ready)
      await slow.waitForTimeout(700)
      await slow.screenshot({ path: join(out, `nos-marca-texto-riscando-${name}.png`), clip: await slow.locator('.facts').boundingBox() })
      console.log('ok', `nos-marca-texto-riscando-${name}`)
      await slow.close()
    }
    await go('/b/telas')
    await shot('telas', true)
    await setStored('b:perfil', null)

    // Library management.
    await go('/b/biblioteca?selecionar=1')
    await page.locator('.gcard.pick').nth(0).click()
    await page.locator('.gcard.pick').nth(2).click()
    await page.locator('.gcard.pick').nth(3).click()
    await page.waitForTimeout(250)
    await shot('biblioteca-selecao')
    await page.getByRole('button', { name: 'Arquivar' }).click()
    await page.waitForTimeout(350)
    await shot('biblioteca-arquivados-desfazer')
    await page.getByRole('button', { name: 'Desfazer' }).click()

    if (!both) {
      await go('/b/biblioteca?humor=Para rir&modo=Co-op local')
      await page.getByRole('button', { name: 'Salvar este filtro' }).click()
      await page.getByLabel('Nome do atalho').fill('Rir no sofá')
      await page.waitForTimeout(200)
      await shot('biblioteca-salvar-filtro')
      await page.getByRole('button', { name: 'Salvar', exact: true }).click()
      await page.getByRole('button', { name: 'Editar atalhos' }).click()
      await page.waitForTimeout(300)
      await shot('biblioteca-editar-atalhos')

      await go('/b/biblioteca?filtros=1')
      await page.locator('.fgroup summary').last().click()
      await page.getByRole('button', { name: 'Nova tag' }).click()
      await page.getByLabel('Nome da nova tag').fill('Com vinho')
      await page.waitForTimeout(200)
      await page.locator('.newtag').scrollIntoViewIfNeeded()
      await shot('filtros-nova-tag')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(250)
      await shot('filtros-nova-tag-criada')

      // Manual add: invalid link, recognised links, Steam fill, cover from the phone.
      await go('/b/adicionar?manual=1')
      await page.getByLabel('Título').fill('Jogo de tabuleiro da vó')
      await page.getByLabel(/Links de lojas/).fill('isso nao e link')
      await page.getByRole('button', { name: 'Adicionar link' }).click()
      await page.waitForTimeout(200)
      await shot('adicionar-manual-link-invalido', true)
      for (const link of ['https://www.gog.com/game/celeste', 'itch.io/jogo', 'https://store.steampowered.com/app/504230/Celeste/']) {
        await page.getByLabel(/Links de lojas/).fill(link)
        await page.getByRole('button', { name: 'Adicionar link' }).click()
      }
      await page.locator('.coverpick input[type=file]').setInputFiles(photo)
      await page.waitForTimeout(500)
      await shot('adicionar-manual-links', true)
      await page.getByRole('button', { name: 'Preencher com os dados da Steam' }).click()
      await page.waitForTimeout(400)
      await shot('adicionar-manual-steam', true)
      await page.getByRole('button', { name: 'Continuar' }).click()
      await page.waitForTimeout(300)
      await shot('adicionar-manual-confirmar-completo', true)
      await go('/b/adicionar?manual=1')
      await page.getByLabel(/Links de lojas/).fill('https://store.steampowered.com/app/999999999/')
      await page.getByRole('button', { name: 'Adicionar link' }).click()
      await page.getByRole('button', { name: 'Preencher com os dados da Steam' }).click()
      await page.waitForTimeout(400)
      await page.locator('.steam-offer').scrollIntoViewIfNeeded()
      await shot('adicionar-manual-steam-nao-achou')

      // Game page: store links, edit, remove with confirmation and undo.
      await go('/b/jogo/raft?editar=1')
      await page.locator('#editar').scrollIntoViewIfNeeded()
      await shot('jogo-editar')
      await page.locator('#editar').screenshot({ path: join(out, `jogo-editar-inteiro-${name}.png`) })
      await go('/b/jogo/raft')
      await page.getByRole('button', { name: 'Remover', exact: true }).click()
      await page.waitForTimeout(250)
      await page.locator('.manage').scrollIntoViewIfNeeded()
      await shot('jogo-remover-confirmar')
      await page.getByRole('button', { name: 'Remover jogo' }).click()
      await page.waitForURL(/\/b\/biblioteca/)
      await page.waitForTimeout(350)
      await shot('jogo-removido-desfazer')

      // Second stamp: "Zeramos juntos" and the one burst (Maellen stamps a game Danilo already finished).
      await setStored('viewer', 'maellen')
      await go('/b/jogo/hades')
      await page.getByRole('button', { name: 'Carimbar: zerei' }).click()
      await page.waitForTimeout(520)
      await page.locator('.stampcard').scrollIntoViewIfNeeded()
      await shot('zeramos-juntos-rajada')
      await page.waitForTimeout(1300)
      await page.locator('.tabbar a[href$="/diario"]').click()
      await page.waitForURL(/\/b\/diario/)
      await page.waitForTimeout(500)
      await shot('diario-zeramos-juntos', true)
      await setStored('viewer', 'danilo')

      await go('/b/diario?nova=1')
      await shot('diario-registrar')
      await go('/b/diario?editar=s12')
      await page.locator('.diary-item--edit').scrollIntoViewIfNeeded()
      await shot('diario-editar')
      await page.getByRole('button', { name: 'Remover sessão' }).click()
      await page.waitForTimeout(200)
      await page.locator('.confirm-box').scrollIntoViewIfNeeded()
      await shot('diario-remover-confirmar')

      // Draw: the strip mid-slide and landed.
      await go('/b/sortear')
      await page.getByRole('button', { name: /Sortear entre/ }).click()
      await page.waitForTimeout(350)
      await shot('sortear-fila-no-meio')
      await page.waitForTimeout(2200)
      await shot('sortear-fila-resultado')
    } else {
      await go('/b/sortear')
      await page.getByRole('button', { name: /Sortear entre/ }).click()
      await page.waitForTimeout(2600)
      await shot('sortear-fila-resultado')
    }
  }

  if (!part || part === 'states') {
    await go('/b/entrar')
    await page.waitForTimeout(900)
    await shot('entrar')
    await page.goto(url('/b/entrar', 'lento=0'), { waitUntil: 'load' })
    await page.waitForSelector('.door')
    await page.waitForTimeout(260)
    await shot('entrar-no-meio')
    await go('/b/entrar', 'lento=1')
    await page.waitForTimeout(900)
    await page.getByRole('button', { name: /Entrar com Google/ }).click()
    await page.waitForTimeout(400)
    await shot('entrar-entrando')
    await go('/b/sem-acesso')
    await shot('sem-acesso')

    await goSlow('/b/')
    await shot('carregando-inicio', true)
    await goSlow('/b/biblioteca')
    await shot('carregando-biblioteca')
    await goSlow('/b/jogo/cuphead')
    await shot('carregando-jogo')
    await goSlow('/b/diario')
    await shot('carregando-diario')

    await go('/b/adicionar', 'lento=1')
    await page.getByRole('searchbox').fill('cel')
    await page.waitForTimeout(900)
    await shot('adicionar-procurando')
    await go('/b/adicionar')
    await page.getByRole('searchbox').fill('erro')
    await page.waitForTimeout(600)
    await shot('adicionar-erro')

    await page.goto(url('/b/jogo/cuphead?avaliar=1', 'lento=1'), { waitUntil: 'load' })
    await page.waitForSelector('.editor', { timeout: 15000 })
    await page.locator('.editor textarea').fill('Lindo, cruel e injusto.')
    await page.getByRole('button', { name: 'Guardar nota' }).click()
    await page.waitForTimeout(500)
    await page.locator('.editor').scrollIntoViewIfNeeded()
    await shot('salvando-nota')

    await go('/b/jogo/cuphead?avaliar=1', 'lento=0&falha=1')
    await page.locator('.editor textarea').fill('Lindo, cruel e injusto.')
    await page.locator('#nota').fill('6.5')
    await page.getByRole('button', { name: 'Guardar nota' }).click()
    await page.waitForTimeout(400)
    await page.locator('.editor').scrollIntoViewIfNeeded()
    await shot('erro-ao-salvar')
    const kept = await page.locator('.editor textarea').inputValue()
    if (kept !== 'Lindo, cruel e injusto.') fail('typed comment was lost after the failed save')

    await go('/b/jogo/cuphead', 'lento=0&falha=1')
    await page.getByLabel('Sua situação').selectOption('jogando')
    await page.waitForTimeout(400)
    await page.locator('.states').scrollIntoViewIfNeeded()
    await shot('erro-ao-salvar-situacao')

    await go('/b/')
    await ctx.setOffline(true)
    await page.waitForTimeout(400)
    await shot('offline')
    await ctx.setOffline(false)

    await go('/b/jogo/nao-existe')
    await shot('jogo-nao-encontrado')
    await go('/b/pagina-que-nao-existe')
    await shot('pagina-nao-encontrada')

    await go('/b/estilo')
    expectError = true // this click throws on purpose
    await page.getByRole('button', { name: 'Provocar erro inesperado' }).click()
    await page.waitForTimeout(400)
    await shot('erro-inesperado')
    expectError = false
  }
  await ctx.close()

  // Dark theme review: every screen and state again, with the theme forced through the saved choice.
  if (!part || part === 'escuro') {
    const dctx = await browser.newContext({ ...size, locale: 'pt-BR' })
    await dctx.addInitScript(() => { try { localStorage.setItem('dan-mah:tema', 'dark') } catch { /* ignore */ } })
    const dp = await dctx.newPage()
    let expected = false
    dp.on('pageerror', (e) => { if (!expected) fail(`page error (dark): ${e.message}`) })
    const durl = (path, query) => base + path + (path.includes('?') ? '&' : '?') + query
    const dgo = async (path, query = 'lento=0') => {
      await dp.goto(durl(path, query), { waitUntil: 'networkidle' })
      await dp.evaluate(() => document.fonts.ready)
      await dp.waitForTimeout(300)
    }
    const dshot = async (file, fullPage = false) => {
      const overflow = await dp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      if (overflow > 1) fail(`horizontal overflow of ${overflow}px in escuro-${file}`)
      await dp.screenshot({ path: join(out, `escuro-${file}-${name}.png`), fullPage })
      console.log('ok', `escuro-${file}-${name}`)
    }
    const stored = (key, value) => dp.evaluate(([k, v]) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v) } catch { /* ignore */ } }, [key, value])
    const photo = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'covers', '413150-cover.jpg')

    await dgo('/b/entrar'); await dp.waitForTimeout(900); await dshot('entrar')
    await dgo('/b/sem-acesso'); await dshot('sem-acesso')
    await dgo('/b/'); await dshot('inicio', true)
    await dp.goto(durl('/b/', 'lento=1'), { waitUntil: 'load' }); await dp.waitForSelector('.dir-b .page'); await dp.waitForTimeout(500); await dshot('carregando-inicio', true)
    await dp.goto(durl('/b/jogo/cuphead', 'lento=1'), { waitUntil: 'load' }); await dp.waitForSelector('.dir-b .page'); await dp.waitForTimeout(500); await dshot('carregando-jogo')
    await dgo('/b/'); await dctx.setOffline(true); await dp.waitForTimeout(400); await dshot('offline'); await dctx.setOffline(false)

    await dgo('/b/biblioteca'); await dshot('biblioteca', true)
    await dgo('/b/biblioteca?ver=lista'); await dshot('biblioteca-lista')
    await dgo('/b/biblioteca?genero=Estratégia&humor=Para tomar susto'); await dshot('biblioteca-vazia')
    await dgo('/b/biblioteca?filtros=1')
    await dp.getByRole('button', { name: 'Para rir' }).click(); await dp.waitForTimeout(400); await dshot('filtros-abertos')
    await dgo('/b/biblioteca?selecionar=1')
    await dp.locator('.gcard.pick').nth(0).click(); await dp.locator('.gcard.pick').nth(2).click(); await dp.waitForTimeout(250); await dshot('biblioteca-selecao')
    await dp.getByRole('button', { name: 'Arquivar' }).click(); await dp.waitForTimeout(350); await dshot('toast')

    await dgo('/b/jogo/it-takes-two'); await dshot('jogo', true)
    await dgo('/b/jogo/cuphead'); await dshot('jogo-divergente', true)
    await dgo('/b/jogo/cuphead?avaliar=1'); await dp.locator('.editor').scrollIntoViewIfNeeded(); await dshot('avaliar')
    await dgo('/b/jogo/cuphead?avaliar=1', 'lento=0&falha=1')
    await dp.getByRole('button', { name: 'Guardar nota' }).click(); await dp.waitForTimeout(400); await dp.locator('.editor').scrollIntoViewIfNeeded(); await dshot('erro-ao-salvar')
    await dgo('/b/jogo/split-fiction?sessao=1'); await dp.locator('.editor').scrollIntoViewIfNeeded(); await dshot('registrar-sessao')
    await dgo('/b/jogo/raft?editar=1'); await dp.locator('#editar').scrollIntoViewIfNeeded(); await dshot('jogo-editar')
    await dgo('/b/jogo/raft'); await dp.getByRole('button', { name: 'Remover', exact: true }).click(); await dp.waitForTimeout(250); await dp.locator('.manage').scrollIntoViewIfNeeded(); await dshot('jogo-remover-confirmar')

    await dgo('/b/adicionar'); await dp.getByRole('searchbox').fill('cel'); await dp.waitForTimeout(600); await dshot('adicionar-resultados')
    await dgo('/b/adicionar'); await dp.getByRole('searchbox').fill('erro'); await dp.waitForTimeout(600); await dshot('adicionar-erro')
    await dgo('/b/adicionar?manual=1')
    await dp.getByLabel('Título').fill('Jogo de tabuleiro da vó')
    await dp.getByLabel(/Links de lojas/).fill('isso nao e link'); await dp.getByRole('button', { name: 'Adicionar link' }).click()
    for (const link of ['https://www.gog.com/game/celeste', 'https://store.steampowered.com/app/504230/Celeste/']) {
      await dp.getByLabel(/Links de lojas/).fill(link); await dp.getByRole('button', { name: 'Adicionar link' }).click()
    }
    await dp.waitForTimeout(300); await dshot('adicionar-manual', true)
    await dp.getByRole('button', { name: 'Continuar' }).click(); await dp.waitForTimeout(300); await dshot('adicionar-confirmar', true)
    await dp.getByRole('button', { name: 'Quero jogar' }).click(); await dp.getByRole('button', { name: 'Salvar na biblioteca' }).click(); await dp.waitForTimeout(500); await dshot('adicionar-salvo')

    await dgo('/b/sortear?jeito=fila'); await dshot('sortear-inicio', true)
    await dp.getByRole('button', { name: /Sortear entre/ }).click(); await dp.waitForTimeout(6200); await dshot('sortear-fila')
    await dgo('/b/sortear?jeito=pacote')
    await dp.getByRole('button', { name: /Sortear entre/ }).click(); await dp.waitForTimeout(900); await dshot('sortear-pacote-fechado')
    await dp.getByRole('button', { name: 'Abrir o pacote' }).click(); await dp.waitForTimeout(4200); await dshot('sortear-pacote-resultado')

    await dgo('/b/diario'); await dshot('diario', true)
    await dgo('/b/diario?nova=1'); await dshot('diario-registrar')
    await stored('viewer', 'maellen')
    await dgo('/b/jogo/hades'); await dp.getByRole('button', { name: 'Carimbar: zerei' }).click(); await dp.waitForTimeout(1900)
    await dp.locator('.stampcard').scrollIntoViewIfNeeded(); await dshot('zeramos-juntos')
    await dp.locator(name === 'desktop' ? '.top-nav a[href$="/diario"]' : '.tabbar a[href$="/diario"]').click(); await dp.waitForURL(/\/b\/diario/); await dp.waitForTimeout(500); await dshot('diario-zeramos-juntos')
    await stored('viewer', 'danilo')

    await dgo('/b/nos'); await dp.waitForTimeout(900); await dshot('nos', true)
    await dgo('/b/perfil'); await dshot('perfil', true)
    await dp.locator('.profile-form input[type=file]').setInputFiles(photo); await dp.waitForSelector('.photo-canvas'); await dp.waitForTimeout(250); await dshot('perfil-foto')
    await dp.locator('.wall').scrollIntoViewIfNeeded(); await dp.locator('.wall-opt').nth(3).click()
    await dp.getByText('Forte', { exact: true }).click(); await dp.waitForTimeout(400); await dshot('perfil-papel-forte')
    await dgo('/b/'); await dshot('inicio-papel-forte')
    await stored('dan-mah:papel', null); await dp.evaluate(() => { try { for (const k of Object.keys(localStorage)) if (/papel|wall/i.test(k)) localStorage.removeItem(k) } catch { /* ignore */ } })

    await dgo('/b/perfil#papel'); await dp.waitForTimeout(300); await dshot('perfil-papel')
    await dgo('/b/estilo'); await dp.waitForTimeout(900); await dshot('estilo', true)
    await dp.locator('#st-novos').evaluate((n) => n.scrollIntoView({ block: 'start' })); await dp.waitForTimeout(300); await dshot('estilo-novos')
    await dgo('/b/telas'); await dshot('telas', true)
    await dgo('/b/jogo/nao-existe'); await dshot('jogo-nao-encontrado')
    await dctx.close()
  }

  // No horizontal page scroll in either theme, on the main routes, at this size and at the tablet width.
  if (!part || part === 'overflow') {
    for (const theme of ['claro', 'escuro']) {
      for (const width of name === 'mobile' ? [375, 768] : [1440]) {
        const octx = await browser.newContext({ ...size, viewport: { width, height: 900 }, locale: 'pt-BR' })
        const op = await octx.newPage()
        op.on('pageerror', (e) => fail(`page error (${theme} ${width}): ${e.message}`))
        for (const path of ['/b/', '/b/biblioteca', '/b/biblioteca?ver=lista', '/b/biblioteca?filtros=1', '/b/jogo/cuphead?avaliar=1', '/b/adicionar?manual=1', '/b/sortear?jeito=pacote', '/b/diario?nova=1', '/b/nos', '/b/perfil', '/b/entrar', '/b/estilo', '/b/telas']) {
          await op.goto(base + path + (path.includes('?') ? '&' : '?') + `lento=0&tema=${theme}`, { waitUntil: 'networkidle' })
          await op.waitForTimeout(250)
          const over = await op.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
          if (over > 1) fail(`horizontal overflow of ${over}px at ${width} (${theme}) in ${path}`)
        }
        console.log('ok', `sem rolagem lateral ${theme} ${width}`)
        await octx.close()
      }
    }
  }
}

await browser.close()
if (problems > 0) { console.error(`${problems} problem(s)`); process.exit(1) }

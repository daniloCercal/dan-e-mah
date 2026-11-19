'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

interface InstallPrompt extends Event {
  prompt: () => Promise<void>
}

const standalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
const subscribe = (fn: () => void) => {
  const mq = window.matchMedia('(display-mode: standalone)')
  mq.addEventListener('change', fn)
  return () => mq.removeEventListener('change', fn)
}

/** Install instructions, shown only here (never as a pop-up) and hidden once the site runs as an installed app. */
export function InstallHelp() {
  const installed = useSyncExternalStore(subscribe, standalone, () => true)
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)

  useEffect(() => {
    const on = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPrompt) }
    window.addEventListener('beforeinstallprompt', on)
    return () => window.removeEventListener('beforeinstallprompt', on)
  }, [])

  if (installed) return null
  return (
    <section className="sec" aria-labelledby="h-instalar">
      <h2 className="h2" id="h-instalar">Instalar no celular</h2>
      <p className="install-lede">O Dan & Mah abre como um aplicativo, com ícone na tela inicial, sem passar pela loja.</p>
      {prompt && (
        <button type="button" className="btn btn--plain" onClick={() => { void prompt.prompt(); setPrompt(null) }}>Instalar agora</button>
      )}
      <dl className="install">
        <div>
          <dt>iPhone, no Safari</dt>
          <dd>Toque em Compartilhar e depois em “Adicionar à Tela de Início”.</dd>
        </div>
        <div>
          <dt>Android, no Chrome</dt>
          <dd>Abra o menu de três pontos e toque em “Instalar aplicativo”.</dd>
        </div>
      </dl>
    </section>
  )
}

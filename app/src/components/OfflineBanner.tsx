'use client'

import { useSyncExternalStore } from 'react'

function subscribe(fn: () => void) {
  window.addEventListener('online', fn)
  window.addEventListener('offline', fn)
  return () => {
    window.removeEventListener('online', fn)
    window.removeEventListener('offline', fn)
  }
}

/** Says the connection dropped. The status region is always present so screen readers hear the change. */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
  return (
    <div role="status" className={online ? 'sr-only' : 'offline'}>
      {!online && (
        <>
          <span className="offline-dot" aria-hidden="true" />
          <p><strong>Sem conexão.</strong> O que já carregou continua aqui. Para salvar, espere a conexão voltar.</p>
        </>
      )}
    </div>
  )
}

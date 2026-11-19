'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import { Dead } from '@/components/States'

export default function Crash({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Dead
      title="Algo quebrou nesta tela"
      actions={
        <>
          <button type="button" className="btn btn--both" onClick={() => retry()}>Tentar de novo</button>
          {/* A full load on purpose: whatever broke is left behind. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn" href="/">Ir para o início</a>
        </>
      }
    >
      <p>Foi um erro do aplicativo, não seu. O que já estava salvo continua salvo. Tentar de novo costuma resolver.</p>
    </Dead>
  )
}

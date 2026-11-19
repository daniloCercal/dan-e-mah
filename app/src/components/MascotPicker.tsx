'use client'

import { useEffect, useState } from 'react'
import { MASCOTS, Mascot, type MascotId } from './Mascot'
import { useMascot } from '@/lib/mascot'
import { useCalm } from '@/lib/motion'

export function MascotPicker() {
  const { id, setId } = useMascot()
  const calm = useCalm()
  const [cheer, setCheer] = useState<{ id: MascotId; n: number } | null>(null)

  useEffect(() => {
    if (!cheer) return
    const t = setTimeout(() => setCheer(null), 900)
    return () => clearTimeout(t)
  }, [cheer])

  const pick = (next: MascotId) => {
    setId(next)
    if (!calm) setCheer((prev) => ({ id: next, n: (prev?.n ?? 0) + 1 }))
  }

  return (
    <section className="mascot-pick" aria-labelledby="mascote-titulo">
      <h2 className="h2" id="mascote-titulo">Mascote</h2>
      <p className="mascot-pick-sub">Aparece no topo do site e nas reações, só para você.</p>
      <div className="mascot-opts" role="radiogroup" aria-labelledby="mascote-titulo">
        {MASCOTS.map((m) => {
          const on = m.id === id
          const cheering = !calm && cheer?.id === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={[on ? 'mascot-opt on' : 'mascot-opt', cheering && 'a-cheer'].filter(Boolean).join(' ')}
              onClick={() => pick(m.id)}
            >
              <span key={cheering ? cheer.n : 0}>
                <Mascot id={m.id} size={88} />
              </span>
              <span className="mascot-opt-name">{m.label}</span>
              <span className="mascot-opt-about">{m.about}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

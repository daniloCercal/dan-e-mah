'use client'

import { MASCOTS, Mascot } from './Mascot'
import { useMascot } from '@/lib/mascot'

export function MascotPicker() {
  const { id, setId } = useMascot()
  return (
    <section className="mascot-pick" aria-labelledby="mascote-titulo">
      <h2 className="h2" id="mascote-titulo">Mascote</h2>
      <p className="mascot-pick-sub">Aparece no topo do site, só para você.</p>
      <div className="mascot-opts" role="radiogroup" aria-labelledby="mascote-titulo">
        {MASCOTS.map((m) => {
          const on = m.id === id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={on ? 'mascot-opt on' : 'mascot-opt'}
              onClick={() => setId(m.id)}
            >
              <Mascot id={m.id} size={88} />
              <span className="mascot-opt-name">{m.label}</span>
              <span className="mascot-opt-about">{m.about}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

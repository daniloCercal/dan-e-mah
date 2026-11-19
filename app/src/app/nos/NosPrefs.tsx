'use client'

import { useState } from 'react'
import { setPrefs } from '@/app/actions/prefs'
import { useToast } from '@/components/Toast'

type Draft = { blindRatings?: boolean; drawMode?: 'fila' | 'pacote'; decorative?: boolean }

function Switch({ on, set, label, help, disabled }: { on: boolean; set: (v: boolean) => void; label: string; help: string; disabled?: boolean }) {
  return (
    <div className="pref">
      <label className="switch">
        <input type="checkbox" checked={on} disabled={disabled} onChange={(e) => set(e.target.checked)} />
        <span className="switch-ui" aria-hidden="true" />
        {label}
      </label>
      <p className="quiet">{help}</p>
    </div>
  )
}

/** The person's own preferences that belong to the pair: blind ratings and the way of drawing. */
export function NosPrefs({ blindRatings, drawMode, decorative }: { blindRatings: boolean; drawMode: 'fila' | 'pacote'; decorative: boolean }) {
  const toast = useToast()
  const [draft, setDraft] = useState<Draft>({})
  const [busy, setBusy] = useState(false)
  const blind = draft.blindRatings ?? blindRatings
  const mode = draft.drawMode ?? drawMode
  const lively = draft.decorative ?? decorative

  const save = async (patch: Draft) => {
    setDraft((d) => ({ ...d, ...patch }))
    // Applied on the spot; the server render keeps it from then on, so there is no flash on the next load.
    if (patch.decorative !== undefined) document.documentElement.toggleAttribute('data-calm', !patch.decorative)
    setBusy(true)
    const res = await setPrefs(patch).catch(() => null)
    setBusy(false)
    setDraft((d) => {
      const rest = { ...d }
      for (const k of Object.keys(patch) as (keyof Draft)[]) delete rest[k]
      return rest
    })
    if (!res?.ok) {
      if (patch.decorative !== undefined) document.documentElement.toggleAttribute('data-calm', !decorative)
      toast.notify('Não deu para salvar. Confira a conexão e tente de novo.')
    }
  }

  return (
    <section className="sec" aria-labelledby="h-pref">
      <h2 className="h2" id="h-pref">Preferências do clube</h2>
      <div className="prefs">
        <Switch
          on={blind} disabled={busy} set={(v) => void save({ blindRatings: v })} label="Nota às cegas"
          help="Ligado, a nota do outro só aparece para você depois de você dar a sua. Vale só para você; cada um liga ou desliga o seu."
        />
        <Switch
          on={lively} disabled={busy} set={(v) => void save({ decorative: v })} label="Animações decorativas"
          help="Desligado, nada desliza, cai ou comemora: as telas trocam direto, como no modo de movimento reduzido do aparelho. Vale só para você."
        />
        <div className="pref">
          <fieldset className="field draw-mode">
            <legend className="editor-label">Jeito de sortear</legend>
            <div className="wall-seg">
              <label><input className="sr-only" type="radio" name="jeito" checked={mode === 'fila'} disabled={busy} onChange={() => void save({ drawMode: 'fila' })} /><span>Fila</span></label>
              <label><input className="sr-only" type="radio" name="jeito" checked={mode === 'pacote'} disabled={busy} onChange={() => void save({ drawMode: 'pacote' })} /><span>Pacote</span></label>
            </div>
            <p className="quiet">{mode === 'pacote' ? 'Um pacote fechado: você rasga e a última carta é o jogo de hoje.' : 'As capas deslizam pela mesa e param no jogo de hoje.'}</p>
          </fieldset>
        </div>
      </div>
    </section>
  )
}

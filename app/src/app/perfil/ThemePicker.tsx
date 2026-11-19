'use client'

import { setPrefs } from '@/app/actions/prefs'
import { useToast } from '@/components/Toast'
import { setChoice, useThemeChoice } from '@/lib/theme'

const OPTIONS = [
  { id: null, label: 'Do aparelho' },
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
] as const

/** Light, dark, or whatever the device says. Applies at once and follows the account to other devices. */
export function ThemePicker() {
  const toast = useToast()
  const current = useThemeChoice()
  const pick = (id: 'light' | 'dark' | null) => {
    setChoice(id)
    setPrefs({ theme: id }).then((r) => { if (!r.ok) toast.notify('Não deu para guardar o tema na conta.') }, () => toast.notify('Sem conexão: o tema vale só neste aparelho.'))
  }
  return (
    <section className="sec" aria-labelledby="h-tema">
      <h2 className="h2" id="h-tema">Tema</h2>
      <fieldset className="field">
        <legend className="sr-only">Tema</legend>
        <div className="wall-seg">
          {OPTIONS.map((o) => (
            <label key={String(o.id)}>
              <input className="sr-only" type="radio" name="tema" checked={current === o.id} onChange={() => pick(o.id)} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="quiet">Escuro é mais confortável à noite. Enquanto você não escolher, o site segue o aparelho.</p>
    </section>
  )
}

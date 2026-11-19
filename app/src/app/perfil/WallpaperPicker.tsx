'use client'

import { useState } from 'react'
import { setPrefs } from '@/app/actions/prefs'
import { useToast } from '@/components/Toast'
import { useTheme } from '@/lib/theme'
import { levels, tile, wallpaperVars, wallpapers, type Level, type WallChoice } from '@/lib/wallpaper'

const options = [{ id: 'liso', name: 'Liso', about: 'Sem desenho, só a cor de fundo.' }, ...wallpapers]

/** Pick the wallpaper behind the pages and how strong it shows. Applies at once, then is saved to the account. */
export function WallpaperPicker({ initial }: { initial: WallChoice }) {
  const { dark } = useTheme()
  const toast = useToast()
  const [choice, setChoice] = useState(initial)
  const picked = options.find((o) => o.id === choice.id) ?? options[0]

  const change = (next: Partial<WallChoice>) => {
    const merged = { ...choice, ...next }
    setChoice(merged)
    const root = document.documentElement
    for (const k of ['--b-wall-l', '--b-wall-d', '--b-wall-size']) root.style.removeProperty(k)
    for (const [k, v] of Object.entries(wallpaperVars(merged))) root.style.setProperty(k, v)
    setPrefs({ wallpaper: next }).then((r) => { if (!r.ok) toast.notify('Não deu para guardar o papel de parede. Ele vale só até recarregar.') }, () => toast.notify('Sem conexão: o papel de parede vale só até recarregar.'))
  }

  return (
    <section className="wall" id="papel" aria-labelledby="h-papel">
      <h2 className="h2" id="h-papel">Papel de parede</h2>
      <p className="quiet">O desenho que fica no fundo das telas. Muda na hora e vale só para você, em todos os seus aparelhos.</p>

      <div className="wall-grid" role="radiogroup" aria-labelledby="h-papel">
        {options.map((o) => {
          const t = o.id === 'liso' ? null : tile(o.id, 'forte', dark)
          // Big tiles are shrunk in the swatch so the whole drawing shows, not one empty corner of it.
          const full = wallpapers.find((w) => w.id === o.id)?.size
          const shrink = full ? Math.min(1, 120 / full[0]) : 1
          const size = full ? `${full[0] * shrink}px ${full[1] * shrink}px` : undefined
          const on = o.id === picked.id
          return (
            <label key={o.id} className={on ? 'wall-opt wall-opt--on' : 'wall-opt'}>
              <input className="sr-only" type="radio" name="papel" checked={on} onChange={() => change({ id: o.id })} />
              <span className="wall-swatch" style={t ? { backgroundImage: t.image, backgroundSize: size } : undefined} aria-hidden="true" />
              <span className="wall-name">{o.name}</span>
            </label>
          )
        })}
      </div>
      <p className="quiet" role="status">{picked.name}: {picked.about}</p>

      <fieldset className="wall-levels" disabled={picked.id === 'liso'}>
        <legend className="editor-label">Intensidade</legend>
        <div className="wall-seg">
          {levels.map((l) => (
            <label key={l.id}>
              <input className="sr-only" type="radio" name="papel-intensidade" checked={choice.level === l.id} onChange={() => change({ level: l.id as Level })} />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  )
}

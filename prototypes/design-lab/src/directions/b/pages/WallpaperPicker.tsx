import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import type { PersonId } from '../../../data/games'
import { useTheme } from '../lib/theme'
import { levels, setWallpaper, tile, useWallpaperChoice, wallpapers } from '../lib/wallpaper'

/** Profile section: pick the wallpaper behind the pages and how strong it shows. Applies at once. */
export function WallpaperPicker({ person }: { person: PersonId }) {
  const { dark } = useTheme()
  const choice = useWallpaperChoice(person)
  const options = [{ id: 'liso', name: 'Liso', about: 'Sem desenho, só a cor de fundo.' }, ...wallpapers]
  const picked = options.find((o) => o.id === choice.id) ?? options[0]
  // `/b/perfil#papel` (from the screen index and the style page) lands on this section.
  const { hash } = useLocation()
  const section = useRef<HTMLElement>(null)
  useEffect(() => {
    if (hash !== '#papel') return
    // After the shell's scroll-to-top on navigation, which runs later in the same commit.
    const t = window.setTimeout(() => section.current?.scrollIntoView({ block: 'start' }), 60)
    return () => window.clearTimeout(t)
  }, [hash])

  return (
    <section className="wall" id="papel" ref={section} aria-labelledby="h-papel">
      <h2 className="h2" id="h-papel">Papel de parede</h2>
      <p className="quiet">O desenho que fica no fundo das telas. Muda na hora e vale só para você, neste aparelho.</p>

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
              <input className="sr-only" type="radio" name="papel" checked={on} onChange={() => setWallpaper(person, { id: o.id })} />
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
              <input className="sr-only" type="radio" name="papel-intensidade" checked={choice.level === l.id} onChange={() => setWallpaper(person, { level: l.id })} />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  )
}

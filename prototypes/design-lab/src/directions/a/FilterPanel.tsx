import { useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { statusLabels, taxonomy, taxonomyLabels, type PersonId, type Status, type TaxonomyGroup } from '../../data/games'
import { countActive, prefLabels, type FilterState, type Pref } from '../../lib/filters'
import { Chip, Icon } from './ui'

interface Props {
  filters: FilterState
  set: (next: FilterState | ((prev: FilterState) => FilterState)) => void
  toggle: (group: TaxonomyGroup | 'status' | 'prefs', value: string) => void
  clear: () => void
  resultCount: number
  viewer: PersonId
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
}

const tagGroups: TaxonomyGroup[] = ['moods', 'modes', 'genres', 'traits']
const prefOrder: Pref[] = ['match', 'eu-quero', 'par-quer', 'sem-nota', 'dos-dois', 'nao-jogado']
const statusOrder: Status[] = ['jogando', 'pausado', 'zerado', 'abandonado', 'lista']
const minimums = [0, 6, 7, 8, 9]

const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, summary, [tabindex]:not([tabindex="-1"])'

export default function FilterPanel({ filters, set, toggle, clear, resultCount, viewer, onClose, triggerRef }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const labels = prefLabels(viewer)
  const active = countActive(filters)

  // Modal behaviour: lock the page behind, move focus in, and hand it back to the trigger on close.
  useEffect(() => {
    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [triggerRef])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !panel.current) return
    const items = [...panel.current.querySelectorAll<HTMLElement>(focusable)].filter((el) => el.offsetParent !== null)
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="sheet-layer">
      <div className="sheet-scrim" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" ref={panel} onKeyDown={onKeyDown}>
        <header className="sheet-head">
          <h2 id="sheet-title" className="sheet-title">Filtros</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar filtros" data-autofocus>
            <Icon name="close" />
          </button>
        </header>

        <div className="sheet-body">
          <fieldset className="logic">
            <legend>Dentro de cada grupo, o jogo precisa ter</legend>
            <div className="segmented">
              <label>
                <input type="radio" name="logic" checked={filters.logic === 'e'} onChange={() => set((p) => ({ ...p, logic: 'e' }))} />
                <span>Todas as marcadas</span>
              </label>
              <label>
                <input type="radio" name="logic" checked={filters.logic === 'ou'} onChange={() => set((p) => ({ ...p, logic: 'ou' }))} />
                <span>Qualquer uma</span>
              </label>
            </div>
          </fieldset>

          {tagGroups.map((group, i) => (
            <Group key={group} title={taxonomyLabels[group]} count={filters[group].length} open={i < 2}>
              {taxonomy[group].map((tag) => (
                <Chip key={tag} pressed={filters[group].includes(tag)} onClick={() => toggle(group, tag)}>{tag}</Chip>
              ))}
            </Group>
          ))}

          <Group title="Quem quer e situação" count={filters.prefs.length + filters.status.length}>
            {prefOrder.map((pref) => (
              <Chip key={pref} pressed={filters.prefs.includes(pref)} onClick={() => toggle('prefs', pref)}>{labels[pref]}</Chip>
            ))}
            {statusOrder.map((status) => (
              <Chip key={status} pressed={filters.status.includes(status)} onClick={() => toggle('status', status)}>{statusLabels[status]}</Chip>
            ))}
          </Group>

          <Group title="Nota mínima" count={filters.minRating ? 1 : 0}>
            {minimums.map((n) => (
              <Chip key={n} pressed={filters.minRating === n} onClick={() => set((p) => ({ ...p, minRating: n }))}>
                {n === 0 ? 'Qualquer nota' : `${n} ou mais`}
              </Chip>
            ))}
          </Group>

          <Group title={taxonomyLabels.custom} count={filters.custom.length}>
            {taxonomy.custom.map((tag) => (
              <Chip key={tag} pressed={filters.custom.includes(tag)} onClick={() => toggle('custom', tag)}>{tag}</Chip>
            ))}
          </Group>
        </div>

        <footer className="sheet-foot">
          <button type="button" className="btn btn--ghost" onClick={clear} disabled={!active && !filters.q}>Limpar</button>
          <button type="button" className="btn btn--amber sheet-apply" onClick={onClose}>
            <span aria-live="polite">
              {resultCount === 0 ? 'Nenhum jogo assim' : `Ver ${resultCount} ${resultCount === 1 ? 'jogo' : 'jogos'}`}
            </span>
          </button>
        </footer>
      </div>
    </div>
  )
}

function Group({ title, count, open = false, children }: { title: string; count: number; open?: boolean; children: ReactNode }) {
  return (
    <details className="group" open={open || undefined}>
      <summary>
        <span className="group-title">{title}</span>
        {count > 0 && <span className="group-count">{count} {count === 1 ? 'marcado' : 'marcados'}</span>}
        <Icon name="chevron" size={20} />
      </summary>
      <div className="chips">{children}</div>
    </details>
  )
}

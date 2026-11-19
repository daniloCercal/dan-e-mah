import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { taxonomy, taxonomyLabels, type PersonId, type TaxonomyGroup } from '../../data/games'
import { prefLabels, type FilterState, type Pref } from '../../lib/filters'
import { usePrefersReducedMotion } from '../../lib/viewer'
import { Chip, Icon, useMediaQuery } from './ui'

interface Props {
  open: boolean
  onClose: () => void
  filters: FilterState
  set: (next: FilterState | ((prev: FilterState) => FilterState)) => void
  toggle: (group: TaxonomyGroup | 'status' | 'prefs', value: string) => void
  clear: () => void
  count: number
  viewer: PersonId
  triggerRef: RefObject<HTMLButtonElement | null>
}

const focusable = 'button:not(:disabled), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function Group({ title, selected, defaultOpen, children }: { title: string; selected: number; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen || selected > 0)
  const id = `c-fg-${title.replace(/\W+/g, '-')}`
  return (
    <section className="c-sheet__group">
      <h3>
        <button type="button" className="c-sheet__toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          {title}
          {selected > 0 && <span className="c-sheet__count c-num">{selected}</span>}
          <Icon name="chevron" />
        </button>
      </h3>
      {open && <div id={id} className="c-sheet__panel">{children}</div>}
    </section>
  )
}

export function FilterSheet({ open, onClose, filters, set, toggle, clear, count, viewer, triggerRef }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const desktop = useMediaQuery('(min-width: 900px)')
  const reduced = usePrefersReducedMotion()
  const labels = prefLabels(viewer)

  // Focus goes in on open and back to the trigger on close.
  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const frame = requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus())
    return () => {
      cancelAnimationFrame(frame)
      trigger?.focus()
    }
  }, [open, triggerRef])

  // The phone sheet is modal: the page behind must not scroll.
  useEffect(() => {
    if (!open || desktop) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, desktop])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panel.current) return
    const items = [...panel.current.querySelectorAll<HTMLElement>(focusable)]
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }

  const hidden = reduced ? { opacity: 0 } : desktop ? { x: '100%' } : { y: '100%' }
  const tagGroup = (group: TaxonomyGroup, defaultOpen = false) => (
    <Group title={taxonomyLabels[group]} selected={filters[group].length} defaultOpen={defaultOpen}>
      <div className="c-chips">
        {taxonomy[group].map((tag) => (
          <Chip key={tag} pressed={filters[group].includes(tag)} onClick={() => toggle(group, tag)}>{tag}</Chip>
        ))}
      </div>
    </Group>
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="c-sheet__scrim" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          />
          <motion.div
            ref={panel} className="c-sheet" role="dialog" aria-modal="true" aria-labelledby="c-sheet-title" onKeyDown={onKeyDown}
            initial={hidden} animate={{ x: 0, y: 0, opacity: 1 }} exit={hidden}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="c-sheet__head">
              <h2 id="c-sheet-title" className="c-h2">Filtros</h2>
              <button type="button" className="c-iconbtn" onClick={onClose} aria-label="Fechar filtros" data-autofocus>
                <Icon name="close" />
              </button>
            </div>
            <div className="c-sheet__body">
              <div className="c-sheet__logic">
                <span id="c-logic-label">Dentro de um grupo, o jogo precisa ter</span>
                <div className="c-seg" role="group" aria-labelledby="c-logic-label">
                  <button type="button" aria-pressed={filters.logic === 'e'} onClick={() => set((f) => ({ ...f, logic: 'e' }))}>Todas (E)</button>
                  <button type="button" aria-pressed={filters.logic === 'ou'} onClick={() => set((f) => ({ ...f, logic: 'ou' }))}>Qualquer uma (OU)</button>
                </div>
              </div>
              {tagGroup('moods', true)}
              {tagGroup('modes', true)}
              {tagGroup('genres')}
              {tagGroup('traits')}
              <Group title="Quem quer e situação" selected={filters.prefs.length}>
                <div className="c-chips">
                  {(Object.keys(labels) as Pref[]).map((p) => (
                    <Chip key={p} pressed={filters.prefs.includes(p)} onClick={() => toggle('prefs', p)}>{labels[p]}</Chip>
                  ))}
                </div>
              </Group>
              <Group title="Nota mínima" selected={filters.minRating ? 1 : 0}>
                <div className="c-sheet__rating">
                  <input
                    className="c-range" type="range" min={0} max={10} step={0.5} value={filters.minRating}
                    aria-label="Nota mínima" aria-valuetext={filters.minRating ? `${filters.minRating} ou mais` : 'Qualquer nota'}
                    onChange={(e) => set((f) => ({ ...f, minRating: Number(e.target.value) }))}
                  />
                  <span className="c-num">{filters.minRating ? filters.minRating.toLocaleString('pt-BR', { minimumFractionDigits: 1 }) : '0,0'}</span>
                </div>
                <p className="c-muted c-small">{filters.minRating ? 'Vale a média da dupla; sem ela, a sua nota.' : 'Arraste para exigir uma nota. Em zero, qualquer jogo entra.'}</p>
              </Group>
              {tagGroup('custom')}
            </div>
            <div className="c-sheet__foot">
              <button type="button" className="c-btn c-btn--quiet" onClick={clear}>Limpar</button>
              <button type="button" className="c-btn c-btn--primary" onClick={onClose}>
                {count === 0 ? 'Nenhum jogo assim' : count === 1 ? 'Ver 1 jogo' : `Ver ${count} jogos`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

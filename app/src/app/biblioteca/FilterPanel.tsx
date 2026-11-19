'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useCalm } from '@/lib/motion'
import { useMember } from '@/lib/member'
import { groupKind, groupLabels, prefLabels, type FilterState, type Pref, type Tag, type TagGroup } from '@/lib/filters'
import { NewTag } from '@/components/Fields'
import { IconCheck, IconChevron, IconClose } from '@/components/icons'

interface Props {
  open: boolean
  onClose: () => void
  trigger: RefObject<HTMLButtonElement | null>
  count: number
  filters: FilterState
  tags: Tag[]
  set: (next: FilterState | ((prev: FilterState) => FilterState)) => void
  toggle: (group: TagGroup | 'prefs', value: string) => void
  clear: () => void
}

const focusable = 'button:not([disabled]), summary, a[href], input, select, [tabindex]:not([tabindex="-1"])'

function Group({ title, selected, open, children }: { title: string; selected: number; open?: boolean; children: ReactNode }) {
  return (
    <details className="fgroup" open={open}>
      <summary>
        <span>{title}</span>
        {selected > 0 && <span className="count">{selected}</span>}
        <IconChevron size={20} />
      </summary>
      <div className="fgroup-body">{children}</div>
    </details>
  )
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={on ? 'chip chip--on' : 'chip'} aria-pressed={on} onClick={onClick}>
      {on && <IconCheck size={16} />}
      {children}
    </button>
  )
}

export default function FilterPanel({ open, onClose, trigger, count, filters, tags, set, toggle, clear }: Props) {
  const member = useMember()
  const reduced = useCalm()
  const panel = useRef<HTMLDivElement>(null)
  const [leaving, setLeaving] = useState(false)

  // Closing plays the exit first; the parent only unmounts the panel when it ends.
  const close = useCallback(() => {
    if (reduced) {
      onClose()
      return
    }
    setLeaving(true)
    window.setTimeout(() => {
      setLeaving(false)
      onClose()
    }, 200)
  }, [onClose, reduced])

  useEffect(() => {
    if (!open) return
    const returnTo = trigger.current
    const node = panel.current
    node?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    const phone = window.matchMedia('(max-width: 899px)').matches
    if (phone) document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll<HTMLElement>(focusable)].filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement
      if (!node.contains(current)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && current === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && current === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      returnTo?.focus()
    }
  }, [open, close, trigger])

  if (!open) return null

  const labels = prefLabels(member?.person ?? 'danilo')
  const tagGroup = (g: TagGroup, isOpen?: boolean) => (
    <Group title={groupLabels[g]} selected={filters[g].length} open={isOpen}>
      <div className="chips">
        {tags.filter((t) => t.kind === groupKind[g]).map((t) => (
          <Choice key={t.id} on={filters[g].includes(t.slug)} onClick={() => toggle(g, t.slug)}>{t.name}</Choice>
        ))}
        {g === 'custom' && <NewTag onCreate={(t) => !filters.custom.includes(t.slug) && toggle('custom', t.slug)} />}
      </div>
    </Group>
  )

  return (
    <div className={leaving ? 'fwrap fwrap--leaving' : 'fwrap'}>
      <div className="fscrim" onClick={close} />
      <div className="fpanel" ref={panel} role="dialog" aria-modal="true" aria-labelledby="f-title">
        <div className="fhead">
          <h2 className="h2" id="f-title">Filtros</h2>
          <button type="button" className="iconbtn" onClick={close} data-autofocus aria-label="Fechar filtros">
            <IconClose />
          </button>
        </div>

        <div className="fscroll">
          <div className="flogic" role="group" aria-label="Como combinar tags do mesmo grupo">
            <span>Dentro de um grupo, o jogo precisa ter</span>
            <div className="seg seg--text">
              <button type="button" aria-pressed={filters.logic === 'e'} onClick={() => set((p) => ({ ...p, logic: 'e' }))}>Todas (E)</button>
              <button type="button" aria-pressed={filters.logic === 'ou'} onClick={() => set((p) => ({ ...p, logic: 'ou' }))}>Qualquer uma (OU)</button>
            </div>
          </div>

          {tagGroup('moods', true)}
          {tagGroup('modes', true)}
          {tagGroup('genres')}
          {tagGroup('traits')}
          <Group title="Quem quer e situação" selected={filters.prefs.length}>
            <div className="chips">
              {(Object.keys(labels) as Pref[]).map((p) => (
                <Choice key={p} on={filters.prefs.includes(p)} onClick={() => toggle('prefs', p)}>{labels[p]}</Choice>
              ))}
            </div>
          </Group>
          <Group title="Nota mínima" selected={filters.minRating ? 1 : 0}>
            <div className="chips">
              {[0, 6, 7, 8, 9].map((n) => (
                <Choice key={n} on={filters.minRating === n} onClick={() => set((p) => ({ ...p, minRating: n }))}>
                  {n === 0 ? 'Qualquer nota' : `${n} ou mais`}
                </Choice>
              ))}
            </div>
          </Group>
          {tagGroup('custom')}
        </div>

        <div className="ffoot">
          <button type="button" className="btn btn--plain" onClick={clear}>Limpar</button>
          <button type="button" className="btn btn--both ffoot-apply" onClick={close}>
            {count === 0 ? 'Nenhum jogo assim' : count === 1 ? 'Ver 1 jogo' : `Ver ${count} jogos`}
          </button>
        </div>
      </div>
    </div>
  )
}

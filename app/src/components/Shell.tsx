'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, type Transition } from 'motion/react'
import { useCalm } from '@/lib/motion'
import { useMascot } from '@/lib/mascot'
import { Mascot } from './Mascot'
import { IconDiary, IconHome, IconLibrary, IconPlus, PairGlyph } from './icons'
import { OfflineBanner } from './OfflineBanner'
import { ThemeToggle } from './ThemeToggle'

const destinations = [
  { href: '/', label: 'Início', icon: <IconHome /> },
  { href: '/biblioteca', label: 'Biblioteca', icon: <IconLibrary /> },
  { href: '/diario', label: 'Diário', icon: <IconDiary /> },
  { href: '/nos', label: 'Nós', icon: <PairGlyph size={18} /> },
] as const

/** Pages that live outside the club: no header, no tab bar. */
const OUTSIDE = ['/entrar']

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Brand() {
  const { id } = useMascot()
  return (
    <Link className="brand" href="/">
      <Mascot id={id} size={40} />
      <span>Dan & Mah</span>
    </Link>
  )
}

function TabLink({ href, label, icon, active, slide }: {
  href: string; label: string; icon: ReactNode; active: boolean; slide: Transition
}) {
  return (
    <Link href={href} className={active ? 'tab active' : 'tab'} aria-current={active ? 'page' : undefined}>
      <span className="tab-ico">
        {active && <motion.span layoutId="b-nav-tab" className="nav-ind" transition={slide} />}
        <span className="nav-label">{icon}</span>
      </span>
      {label}
    </Link>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const calm = useCalm()
  // The active-tab pill slides from the old tab to the new one instead of jumping.
  const slide: Transition = calm ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }

  if (OUTSIDE.some((p) => isActive(pathname, p))) {
    return (
      <main id="conteudo" className="outside">
        <OfflineBanner />
        {children}
      </main>
    )
  }

  const addActive = isActive(pathname, '/adicionar')

  return (
    <>
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>
      <header className="top">
        <div className="top-in">
          <Brand />
          <nav className="top-nav" aria-label="Principal">
            {destinations.map((d) => {
              const active = isActive(pathname, d.href)
              return (
                <Link key={d.href} href={d.href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>
                  {active && <motion.span layoutId="b-nav-top" className="nav-ind" transition={slide} />}
                  <span className="nav-label">{d.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="top-side">
            <Link className="btn btn--both top-add" href="/adicionar">
              <IconPlus size={20} />
              Adicionar jogo
            </Link>
            <ThemeToggle />
            <Link className="top-me" href="/perfil" aria-label="Seu perfil">
              {/* Placeholder until sign-in exists: an empty seat, drawn like the empty circles of the mark. */}
              <span className="mark mark--empty" style={{ ['--s' as string]: '36px' }} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>
      <OfflineBanner />

      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>

      <nav className="tabbar" aria-label="Principal, barra inferior">
        {destinations.slice(0, 2).map((d) => (
          <TabLink key={d.href} {...d} active={isActive(pathname, d.href)} slide={slide} />
        ))}
        <Link href="/adicionar" className={addActive ? 'tab tab--add active' : 'tab tab--add'} aria-current={addActive ? 'page' : undefined}>
          <span className="tab-plus"><IconPlus size={26} /></span>
          Adicionar
        </Link>
        {destinations.slice(2).map((d) => (
          <TabLink key={d.href} {...d} active={isActive(pathname, d.href)} slide={slide} />
        ))}
      </nav>
    </>
  )
}

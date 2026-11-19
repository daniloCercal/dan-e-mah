import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Icon, spring, type IconName } from './ui'

const destinations: { to: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { to: '/c', label: 'Início', icon: 'home', match: (p) => p === '' || p.startsWith('sortear') },
  { to: '/c/biblioteca', label: 'Biblioteca', icon: 'cards', match: (p) => p.startsWith('biblioteca') || p.startsWith('jogo') },
  { to: '/c/diario', label: 'Diário', icon: 'diary', match: (p) => p.startsWith('diario') },
  { to: '/c/nos', label: 'Nós', icon: 'duo', match: (p) => p.startsWith('nos') },
]

function NavLinks({ variant, path }: { variant: 'pill' | 'bar'; path: string }) {
  return (
    <ul className={`c-nav__list c-nav__list--${variant}`}>
      {destinations.map((d) => {
        const active = d.match(path)
        return (
          <li key={d.to}>
            <Link to={d.to} className="c-nav__link" aria-current={active ? 'page' : undefined}>
              {active && <motion.span layoutId={`c-nav-${variant}`} className="c-nav__indicator" transition={spring} />}
              <span className="c-nav__content">
                <Icon name={d.icon} size={variant === 'pill' ? 22 : 18} />
                <span>{d.label}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const path = pathname.replace(/^\/c\/?/, '')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <a className="c-skip" href="#conteudo">Pular para o conteúdo</a>
      <header className="c-top">
        <Link to="/c" className="c-wordmark" aria-label="Jogos em dupla, início">
          Jogos <span>em dupla</span>
        </Link>
        <nav className="c-top__nav" aria-label="Principal">
          <NavLinks variant="bar" path={path} />
        </nav>
        <div className="c-top__actions">
          <Link to="/c/sortear" className="c-btn c-btn--quiet c-top__draw">
            <Icon name="shuffle" size={18} /> Sortear
          </Link>
          <Link to="/c/adicionar" className="c-btn c-btn--primary c-top__add">
            <Icon name="plus" size={18} /> Adicionar jogo
          </Link>
          <Link to="/design-lab" className="c-top__lab">Comparar direções</Link>
        </div>
      </header>

      <main id="conteudo" className="c-main" tabIndex={-1}>
        {children}
      </main>

      <div className="c-dock">
        <nav className="c-dock__pill" aria-label="Principal">
          <NavLinks variant="pill" path={path} />
        </nav>
        <Link
          to="/c/adicionar" className="c-dock__add" aria-label="Adicionar jogo"
          aria-current={path.startsWith('adicionar') ? 'page' : undefined}
        >
          <Icon name="plus" size={24} />
          <span>Novo</span>
        </Link>
      </div>
    </>
  )
}

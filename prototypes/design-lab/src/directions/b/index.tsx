import faceSvg from './assets/rosto-anim.svg?raw'
import { useEffect, useLayoutEffect } from 'react'
import { motion } from 'motion/react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { useViewer } from '../../lib/viewer'
import { B, ClubProvider } from './store'
import { ProfileProvider, nameOf, useCalm } from './lib/profile'
import { ToastHost } from './components/Fields'
import { routeCommitted } from './lib/transitions'
import { IconDiary, IconHome, IconLibrary, IconPlus, PairGlyph } from './components/icons'
import { Mark } from './components/Marks'
import { syncThemeFromQuery, useTheme } from './lib/theme'
import { useWallpaper } from './lib/wallpaper'
import { ErrorBoundary, NotFound, OfflineBanner } from './components/States'
import Home from './pages/Home'
import Library from './pages/Library'
import GameDetail from './pages/GameDetail'
import AddGame from './pages/AddGame'
import Draw from './pages/Draw'
import Diary from './pages/Diary'
import Us from './pages/Us'
import StyleGuide from './pages/StyleGuide'
import Profile from './pages/Profile'
import Screens from './pages/Screens'
import { NoAccess, SignIn } from './pages/Door'
import './styles/base.css'
import './styles/parts.css'
import './styles/pages.css'
import './styles/detail.css'
import './styles/flows.css'
import './styles/states.css'
import './styles/more.css'

const destinations = [
  { to: B, end: true, label: 'Início', icon: <IconHome /> },
  { to: `${B}/biblioteca`, end: false, label: 'Biblioteca', icon: <IconLibrary /> },
  { to: `${B}/diario`, end: false, label: 'Diário', icon: <IconDiary /> },
  { to: `${B}/nos`, end: false, label: 'Nós', icon: <PairGlyph size={18} /> },
]

/** Sun when it is dark (tap for light), moon when it is light (tap for dark). */
function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button type="button" className="iconbtn theme-toggle" onClick={toggle} aria-pressed={dark} aria-label="Modo escuro">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  )
}

function Shell() {
  const { viewer } = useViewer()
  useWallpaper(viewer)
  const location = useLocation()
  const navType = useNavigationType()
  const { pathname } = location
  const calm = useCalm()
  const navigate = useNavigate()
  // "/b/" and "/b" are the same page; without this the Início tab would not light up on the first.
  useEffect(() => {
    if (pathname.length > 1 && pathname.endsWith('/')) navigate(pathname.slice(0, -1) + location.search + location.hash, { replace: true })
  }, [pathname, location.search, location.hash, navigate])
  // The active-tab pill slides from the old tab to the new one instead of jumping.
  const slide = calm ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 34 }
  const outside = /\/(entrar|sem-acesso)\/?$/.test(pathname)

  // Lets a pending cover transition know the new route is on screen.
  useLayoutEffect(() => {
    routeCommitted()
    syncThemeFromQuery()
  }, [location.key])

  // Going back keeps the scroll position the browser restores; going forward starts at the top.
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0)
  }, [pathname, navType])

  if (outside) {
    return (
      <main id="conteudo" className="outside">
        <OfflineBanner />
        <ErrorBoundary resetKey={pathname}>
          <Routes>
            <Route path="entrar" element={<SignIn />} />
            <Route path="sem-acesso" element={<NoAccess />} />
          </Routes>
        </ErrorBoundary>
        <Link className="lab-link outside-lab" to="/design-lab">Comparar direções</Link>
      </main>
    )
  }

  return (
    <>
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>
      <header className="top">
        <div className="top-in">
          <Link className="brand" to={B}>
            <span className="brand-face" aria-hidden="true" dangerouslySetInnerHTML={{ __html: faceSvg }} />
            <span>Dan & Mah</span>
          </Link>
          <nav className="top-nav" aria-label="Principal">
            {destinations.map((d) => (
              <NavLink key={d.to} to={d.to} end={d.end}>
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="b-nav-top" className="nav-ind" transition={slide} />}
                    <span className="nav-label">{d.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="top-side">
            <Link className="lab-link" to="/design-lab">Comparar direções</Link>
            <Link className="btn btn--both top-add" to={`${B}/adicionar`}>
              <IconPlus size={20} />
              Adicionar jogo
            </Link>
            <ThemeToggle />
            <Link className="top-me" to={`${B}/perfil`} aria-label={`Seu perfil, ${nameOf(viewer)}`}>
              <Mark person={viewer} size={36} named={false} />
            </Link>
          </div>
        </div>
      </header>
      <OfflineBanner />

      <main id="conteudo" tabIndex={-1}>
        <ErrorBoundary resetKey={pathname}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="biblioteca" element={<Library />} />
            <Route path="jogo/:id" element={<GameDetail />} />
            <Route path="adicionar" element={<AddGame />} />
            <Route path="sortear" element={<Draw />} />
            <Route path="diario" element={<Diary />} />
            <Route path="nos" element={<Us />} />
            <Route path="estilo" element={<StyleGuide />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="perfil/:id" element={<Profile />} />
            <Route path="telas" element={<Screens />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
        <footer className="foot">
          <Link to={`${B}/telas`}>Todas as telas</Link>
          <Link to={`${B}/estilo`}>Paleta, tipografia e motion</Link>
        </footer>
      </main>
      <ToastHost />

      <nav className="tabbar" aria-label="Principal, barra inferior">
        {destinations.slice(0, 2).map((d) => (
          <NavLink key={d.to} to={d.to} end={d.end} className="tab">
            {({ isActive }) => (
              <>
                <span className="tab-ico">
                  {isActive && <motion.span layoutId="b-nav-tab" className="nav-ind" transition={slide} />}
                  <span className="nav-label">{d.icon}</span>
                </span>
                {d.label}
              </>
            )}
          </NavLink>
        ))}
        <NavLink to={`${B}/adicionar`} className="tab tab--add">
          <span className="tab-plus"><IconPlus size={26} /></span>
          Adicionar
        </NavLink>
        {destinations.slice(2).map((d) => (
          <NavLink key={d.to} to={d.to} end={d.end} className="tab">
            {({ isActive }) => (
              <>
                <span className="tab-ico">
                  {isActive && <motion.span layoutId="b-nav-tab" className="nav-ind" transition={slide} />}
                  <span className="nav-label">{d.icon}</span>
                </span>
                {d.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

function Root() {
  const calm = useCalm()
  return (
    <div className={calm ? 'dir-b calm' : 'dir-b'}>
      <ClubProvider>
        <Shell />
      </ClubProvider>
    </div>
  )
}

export default function Direction() {
  return (
    <ProfileProvider>
      <Root />
    </ProfileProvider>
  )
}

import { useLayoutEffect } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './base.css'
import './screens.css'
import './game.css'
import './draw.css'
import { Icon, base } from './ui'
import Home from './Home'
import Library from './Library'
import GamePage from './GamePage'
import AddGame from './AddGame'
import Draw from './Draw'
import Diary from './Diary'
import Us from './Us'
import StyleGuide from './StyleGuide'

const destinations = [
  { to: base, label: 'Início', icon: 'home', end: true },
  { to: `${base}/biblioteca`, label: 'Biblioteca', icon: 'library', end: false },
  { to: `${base}/diario`, label: 'Diário', icon: 'diary', end: false },
  { to: `${base}/nos`, label: 'Nós', icon: 'pair', end: false },
] as const

function ScrollReset() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function Direction() {
  const [first, second, third, fourth] = destinations
  return (
    <div className="dir-a">
      <ScrollReset />
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>

      <header className="top">
        <Link className="wordmark" to={base}>Jogos em dupla</Link>
        <nav className="top-nav" aria-label="Principal">
          {destinations.map((d) => (
            <NavLink key={d.to} to={d.to} end={d.end} className="top-link">{d.label}</NavLink>
          ))}
        </nav>
        <div className="top-side">
          <Link className="top-quiet" to="/design-lab">Comparar direções</Link>
          <Link className="btn btn--line btn--small" to={`${base}/adicionar`}>
            <Icon name="plus" size={18} /> Adicionar jogo
          </Link>
        </div>
      </header>

      <main id="conteudo" className="main">
        <Routes>
          <Route index element={<Home />} />
          <Route path="biblioteca" element={<Library />} />
          <Route path="jogo/:id" element={<GamePage />} />
          <Route path="adicionar" element={<AddGame />} />
          <Route path="sortear" element={<Draw />} />
          <Route path="diario" element={<Diary />} />
          <Route path="nos" element={<Us />} />
          <Route path="estilo" element={<StyleGuide />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="foot">
        <Link to={`${base}/estilo`}>Paleta, tipografia e motion</Link>
        <Link to="/design-lab">Comparar direções</Link>
      </footer>

      <nav className="tabbar" aria-label="Principal no celular">
        {[first, second].map((d) => (
          <NavLink key={d.to} to={d.to} end={d.end} className="tab">
            <Icon name={d.icon} /> <span>{d.label}</span>
          </NavLink>
        ))}
        <NavLink to={`${base}/adicionar`} className="tab tab--add">
          <span className="tab-plus"><Icon name="plus" size={20} /></span> <span>Adicionar</span>
        </NavLink>
        {[third, fourth].map((d) => (
          <NavLink key={d.to} to={d.to} end={d.end} className="tab">
            <Icon name={d.icon} /> <span>{d.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function NotFound() {
  return (
    <div className="page">
      <h1 className="page-title">Esta sessão não está em cartaz</h1>
      <p className="lede">O endereço não leva a nenhuma tela. A biblioteca continua no mesmo lugar.</p>
      <p><Link className="btn btn--line" to={`${base}/biblioteca`}>Ir para a biblioteca</Link></p>
    </div>
  )
}

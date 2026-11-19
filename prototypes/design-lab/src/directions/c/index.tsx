import { Link, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import './css/base.css'
import './css/components.css'
import './css/pages.css'
import './css/draw.css'
import { Shell } from './Shell'
import AddGame from './pages/AddGame'
import Diary from './pages/Diary'
import Draw from './pages/Draw'
import GameDetail from './pages/GameDetail'
import Home from './pages/Home'
import Library from './pages/Library'
import StyleGuide from './pages/StyleGuide'
import Us from './pages/Us'

function NotFound() {
  return (
    <section className="c-page c-wrap">
      <h1 className="c-h1">Essa carta não está no baralho</h1>
      <p className="c-lead">O endereço não existe neste protótipo.</p>
      <Link to="/c" className="c-btn c-btn--primary">Voltar ao início</Link>
    </section>
  )
}

export default function DirectionC() {
  return (
    <div className="dir-c">
      <MotionConfig reducedMotion="user">
        <Shell>
          <Routes>
            <Route index element={<Home />} />
            <Route path="biblioteca" element={<Library />} />
            <Route path="jogo/:id" element={<GameDetail />} />
            <Route path="adicionar" element={<AddGame />} />
            <Route path="sortear" element={<Draw />} />
            <Route path="diario" element={<Diary />} />
            <Route path="nos" element={<Us />} />
            <Route path="estilo" element={<StyleGuide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Shell>
      </MotionConfig>
    </div>
  )
}

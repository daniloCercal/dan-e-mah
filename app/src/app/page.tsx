import Link from 'next/link'
import { PairGlyph } from '@/components/icons'

export default function Home() {
  return (
    <div className="page">
      <h1 className="hello">Boas-vindas ao clube</h1>
      <div className="empty">
        <PairGlyph size={36} />
        <h2 className="h2">A estante ainda está vazia</h2>
        <p className="body">
          Quando vocês adicionarem jogos, aparecem aqui o que estão jogando, o que os dois querem jogar e as últimas sessões.
        </p>
        <div className="empty-actions">
          <Link className="btn btn--both" href="/adicionar">Adicionar o primeiro jogo</Link>
          <Link className="btn" href="/biblioteca">Abrir a biblioteca</Link>
        </div>
      </div>
    </div>
  )
}

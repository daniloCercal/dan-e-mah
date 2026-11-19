import Link from 'next/link'
import { Dead } from '@/components/States'

export default function GameNotFound() {
  return (
    <Dead
      title="Não achamos esse jogo"
      actions={
        <>
          <Link className="btn btn--both" href="/biblioteca">Abrir a biblioteca</Link>
          <Link className="btn btn--plain" href="/adicionar">Adicionar jogo</Link>
        </>
      }
    >
      <p>Ele pode ter sido removido da biblioteca, ou o link está incompleto.</p>
    </Dead>
  )
}

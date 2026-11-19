import { Busy, SkCard, SkNow } from '@/components/Loading'

export default function HomeLoading() {
  return (
    <div className="page home">
      <h1 className="hello">Abrindo o clube</h1>
      <div className="home-top">
        <Busy label="Carregando o que vocês estão jogando"><SkNow /></Busy>
      </div>
      <section className="sec">
        <h2 className="h2">Nós dois queremos jogar</h2>
        <Busy label="Carregando os jogos">
          <div className="shelf">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="shelf-item"><SkCard /></div>)}</div>
        </Busy>
      </section>
    </div>
  )
}

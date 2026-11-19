import { Busy, SkCard } from '@/components/Loading'

export default function LibraryLoading() {
  return (
    <div className="page lib">
      <div className="lib-head">
        <h1 className="h1">Biblioteca</h1>
        <p className="quiet">Abrindo a estante</p>
      </div>
      <Busy label="Carregando a biblioteca">
        <div className="grid">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <SkCard key={i} />)}</div>
      </Busy>
    </div>
  )
}

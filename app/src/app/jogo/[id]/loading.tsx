import { Busy, SkBlock, SkLine } from '@/components/Loading'

export default function GameLoading() {
  return (
    <div className="page detail" aria-busy="true">
      <p className="sr-only" role="status">Carregando o jogo</p>
      <div className="detail-hero" />
      <header className="detail-head">
        <span className="sk sk-cover" />
        <div>
          <SkLine w="70%" tall />
          <SkLine w="45%" />
        </div>
      </header>
      <Busy label="Carregando a situação" className="detail-sk">
        <SkBlock h={236} />
        <SkBlock h={92} />
        <SkBlock h={250} />
      </Busy>
    </div>
  )
}

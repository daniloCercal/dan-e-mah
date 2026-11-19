import { Link } from 'react-router-dom'
import { type PersonId } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { B } from '../store'
import { nameOf, useProfile } from '../lib/profile'
import { useFailSwitch, useSlowSwitch } from '../lib/latency'
import { Mark } from '../components/Marks'
import { useTheme } from '../lib/theme'

function Switch({ on, set, label, help }: { on: boolean; set: (v: boolean) => void; label: string; help: string }) {
  return (
    <div className="pref">
      <label className="switch">
        <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
        <span className="switch-ui" aria-hidden="true" />
        {label}
      </label>
      <p className="quiet">{help}</p>
    </div>
  )
}

/** Preferences, Steam (not linked), install help, account, and the prototype-only switches. */
export default function UsPrefs() {
  const { viewer, setViewer } = useViewer()
  const { decorative, setDecorative } = useProfile()
  const { dark, setDark } = useTheme()
  const [slow, setSlow, slowForced] = useSlowSwitch()
  const [fail, setFail, failForced] = useFailSwitch()

  return (
    <>
      <div className="us-cols">
        <section className="sec" aria-labelledby="h-pref">
          <h2 className="h2" id="h-pref">Preferências</h2>
          <div className="prefs">
            <Switch
              on={dark} set={setDark} label="Modo escuro"
              help="Troca o fundo claro por um escuro, mais confortável à noite. Enquanto você não escolher, o site segue o tema do aparelho."
            />
            <Switch
              on={decorative} set={setDecorative} label="Animações decorativas"
              help="Desligado, nada desliza, cai ou comemora: as telas trocam direto, como no modo de movimento reduzido do aparelho."
            />
          </div>
        </section>

        <section className="sec" aria-labelledby="h-steam">
          <h2 className="h2" id="h-steam">Steam</h2>
          <div className="linkbox">
            <p><strong>Nenhuma conta vinculada.</strong></p>
            <p>Com a conta vinculada, o clube vai poder mostrar as horas jogadas e as conquistas de cada um nos jogos da biblioteca. Para isso, o perfil da Steam e os detalhes dos jogos precisam estar públicos.</p>
            <button type="button" className="btn btn--plain" disabled>Vincular conta Steam</button>
            <p className="quiet">O botão fica desligado no protótipo: ainda não existe conexão de verdade com a Steam, e nenhum número de lá aparece aqui.</p>
          </div>
        </section>
      </div>

      <section className="sec" aria-labelledby="h-instalar">
        <h2 className="h2" id="h-instalar">Instalar no celular</h2>
        <p className="install-lede">O Dan & Mah abre como um aplicativo, com ícone na tela inicial, sem passar pela loja.</p>
        <dl className="install">
          <div>
            <dt>iPhone, no Safari</dt>
            <dd>Toque em Compartilhar e depois em “Adicionar à Tela de Início”.</dd>
          </div>
          <div>
            <dt>Android, no Chrome</dt>
            <dd>Abra o menu de três pontos e toque em “Instalar aplicativo”.</dd>
          </div>
        </dl>
      </section>

      <section className="sec us-exit" aria-labelledby="h-conta">
        <h2 className="h2" id="h-conta">Conta</h2>
        <p className="quiet">Você entrou como {nameOf(viewer)}.</p>
        <Link className="btn btn--plain" to={`${B}/entrar`}>Sair</Link>
      </section>

      <section className="sec proto" aria-labelledby="h-proto">
        <h2 className="h2" id="h-proto">Só no protótipo</h2>
        <p className="quiet">Estes controles existem para testar as telas. Eles não vão para o produto final.</p>
        <fieldset className="field proto-who">
          <legend className="editor-label">Ver o protótipo como</legend>
          <div className="chips" role="radiogroup" aria-label="Ver o protótipo como">
            {(['danilo', 'maellen'] as PersonId[]).map((p) => (
              <button key={p} type="button" role="radio" aria-checked={viewer === p} className={viewer === p ? 'chip chip--on chip--who' : 'chip chip--who'} onClick={() => setViewer(p)}>
                <Mark person={p} size={24} named={false} />
                {nameOf(p)}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="prefs">
          <Switch
            on={slow} set={setSlow} label="Simular conexão lenta"
            help={slowForced ? 'O endereço desta visita está forçando a velocidade. Mexer aqui volta a valer esta chave.' : 'Tudo demora alguns segundos, para dar tempo de ver os estados de carregamento.'}
          />
          <Switch
            on={fail} set={setFail} label="Simular falha ao salvar"
            help={failForced ? 'O endereço desta visita está forçando a falha. Mexer aqui volta a valer esta chave.' : 'Notas, sessões, situações e jogos novos deixam de salvar, para ver o erro e o “tentar de novo”.'}
          />
        </div>
        <p className="proto-links">
          <Link to={`${B}/telas`}>Todas as telas</Link>
          <Link to={`${B}/estilo`}>Paleta, tipografia e motion</Link>
        </p>
      </section>
    </>
  )
}

# Decisão 001 — Ferramentas de design e validação

Data: 18/11/2026. Situação: aplicada nesta fase; pode ser revista. Análise completa em `docs/research/05-ferramentas.md`.

| Ferramenta | Decisão | Motivo |
|---|---|---|
| `frontend-design` (plugin oficial) | Em uso | Já instalado; guia o plano visual de cada direção |
| Impeccable 4.9.2 (Apache-2.0) | Em uso, **só os arquivos da skill** | Copiada para `.claude/skills/impeccable` depois de ler o repositório. O hook automático e o binário do "motor" não foram instalados: o hook roda a cada edição fora da aprovação do modelo e baixa um executável na primeira vez. O binário tem checksum publicado, mas não é auditável por leitura. Sem ele, o detector automático (`impeccable detect`) não roda; as referências de crítica e de qualidade são usadas manualmente. **Decisão sua:** instalar o motor depois, se quiser o detector |
| 21st.dev (plugin e MCP) | Descartado como ferramenta; usado como referência | Exige chave de API; o plano gratuito libera 2 recuperações de código por dia; envia os prompts para fora; vários componentes populares têm licença não informada, então devem ser reescritos e não copiados |
| UI UX Pro Max | Descartado | Redundante com as duas acima; exige Python |
| Taste Skill | Descartado | Traz hook próprio, scripts Node, Chrome headless e downloads |
| Emil Kowalski (`emil-design-eng`) | Opcional, não instalada | Só Markdown, licença MIT. Vale instalar de 1 a 4 das skills de animação na fase de implementação |
| Playwright (Chromium e WebKit) | Em uso | Screenshots em 375, 768 e 1440 px; WebKit simula o Safari do iPhone |
| `@axe-core/playwright` | Planejado para a implementação | Auditoria de acessibilidade automatizada |
| GSAP | Descartado por ora | Licença proprietária; Motion atende |

## Onde as coisas foram instaladas

- Projeto: `D:\projetos\jogos-em-dupla`
- Cache do npm e navegadores do Playwright: `D:\dev-cache` (o disco `C:` tinha 4 GB livres)
- Cópia do repositório do Impeccable usada na leitura: `D:\dev-cache\audit\impeccable` (pode ser apagada)

Nada foi instalado globalmente nem alterado na configuração do Claude Code.

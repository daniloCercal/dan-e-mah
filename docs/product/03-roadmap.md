# Roadmap

Versão 0.1, 18/11/2026. Proposta. A ordem dentro de cada etapa é a ordem de construção.

## MVP

1. Login com Google restrito aos dois e-mails.
2. Biblioteca compartilhada: grade, lista, busca, ordenação.
3. Adicionar jogo com busca no catálogo (IGDB) e cadastro manual.
4. Estados independentes: de cada um e da dupla.
5. Filtros e tags, incluindo tags próprias e filtros salvos, com a seleção na URL.
6. Avaliações individuais, média e diferença.
7. Página de detalhes.
8. Match ("Nós dois queremos jogar").
9. Sorteio ("O que vamos jogar?").
10. Instalável no celular (PWA). **Proposta**: entrou no MVP porque o uso será principalmente no celular.

Fica de fora do MVP, mas com espaço reservado na navegação: Diário e Nós.

## V2

| Item | Valor | Complexidade | Frequência de uso |
|---|---|---|---|
| Diário de sessões | Alto | Baixa | Semanal |
| Estatísticas da dupla | Médio | Média | Mensal |
| Exportar e importar CSV/JSON | Médio (também é o backup) | Baixa | Rara |
| Steam: vincular, importar biblioteca e horas | Alto, se os perfis forem públicos | Média | Na configuração e a cada sincronização |
| Steam: conquistas | Médio | Média | Ocasional |
| Coleções e favoritos | Médio | Baixa | Ocasional |
| Operações em lote na biblioteca | Baixo no início, cresce com a biblioteca | Média | Rara |

## Experimentais

Avaliados pelo que a pesquisa mostrou e pelo tamanho do público (duas pessoas).

| Ideia | Valor | Complexidade | Frequência | Veredito |
|---|---|---|---|---|
| Nota às cegas: a nota do outro só aparece depois que você dá a sua | Alto | Baixa | A cada avaliação | **Recomendo testar cedo.** É padrão em apps de casal e torna a comparação um momento |
| Retrospectiva anual | Alto, uma vez por ano | Média | Anual | Fazer quando houver um ano de dados |
| Calendário de jogatinas | Médio | Média | Semanal, se pegar | Testar depois do diário |
| "Faz tempo que está parado" (lembrete dentro do site) | Médio | Baixa | Ocasional | Barato; entra junto com o diário |
| Recomendações pelo histórico (regras, sem IA paga) | Médio | Média | Ocasional | Só com biblioteca grande |
| Desafios mensais | Baixo a médio | Média | Mensal | Esperar; risco de virar obrigação |
| Bingo gamer | Baixo | Média | Rara | Esperar |
| Ranking conjunto | Baixo | Baixa | Rara | O top da dupla nas estatísticas já cobre |
| Notificações | Baixo | Alta no iOS | — | Não recomendo: no iPhone só funciona com o app instalado e para duas pessoas uma mensagem resolve |

## Portões de aprovação

| Portão | O que você aprova | Situação |
|---|---|---|
| 1 | Direção visual | **Aguardando você** |
| 2 | Arquitetura, modelo de dados e plano de implementação | Depois do portão 1 |
| 3 | MVP validado antes das funcionalidades da V2 | — |
| 4 | Deploy em produção | Só com autorização explícita |

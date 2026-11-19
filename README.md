# Jogos em dupla

Plataforma privada para duas pessoas acompanharem os jogos que jogaram, estão jogando e querem jogar. Nome provisório.

**Fase atual:** protótipos visuais, aguardando aprovação da direção. Nada aqui é a implementação definitiva.

## Ver os protótipos

```powershell
cd D:\projetos\jogos-em-dupla\prototypes\design-lab
node scripts/fetch-covers.mjs   # só na primeira vez: baixa as capas de exemplo
npm run dev -- --host
```

Abra `http://localhost:5173/design-lab`. Para ver no celular, conecte-o ao mesmo Wi-Fi e abra o endereço "Network" que o comando mostra.

Os dados são fictícios (jogos reais, notas e sessões inventadas).

## Onde está cada coisa

| Pasta | Conteúdo |
|---|---|
| `docs/product/` | Product brief, mapa da experiência, roadmap |
| `docs/research/` | Concorrentes, referências visuais, motion, APIs, ferramentas |
| `docs/architecture/` | Recomendação técnica preliminar |
| `docs/decisions/` | Decisões tomadas e pendências de aprovação |
| `artifacts/screenshots/` | Capturas de cada direção em 375, 768 e 1440 px |
| `prototypes/design-lab/` | Protótipo descartável com as três direções |

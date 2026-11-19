// Checks that the Twitch/IGDB credentials in .env.local work. Never prints the secret or the token.
// Usage: node scripts/test-igdb.mjs "nome do jogo"
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env.local')
const env = Object.fromEntries(
  (await readFile(envPath, 'utf8'))
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)
const id = env.TWITCH_CLIENT_ID
const secret = env.TWITCH_CLIENT_SECRET
if (!id || !secret) {
  console.log(`faltando: ${!id ? 'TWITCH_CLIENT_ID ' : ''}${!secret ? 'TWITCH_CLIENT_SECRET' : ''}`)
  process.exit(1)
}
console.log(`client id: ${id.length} caracteres; secret: ${secret.length} caracteres`)

const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
  method: 'POST',
  body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: 'client_credentials' }),
})
if (!tokenRes.ok) {
  const body = await tokenRes.json().catch(() => ({}))
  console.log(`token recusado: HTTP ${tokenRes.status} ${body.message ?? ''}`)
  process.exit(1)
}
const { access_token, expires_in } = await tokenRes.json()
console.log(`token ok, vale por ${Math.round(expires_in / 86400)} dias`)

const term = process.argv[2] ?? 'It Takes Two'
const res = await fetch('https://api.igdb.com/v4/games', {
  method: 'POST',
  headers: { 'Client-ID': id, Authorization: `Bearer ${access_token}`, Accept: 'application/json' },
  body: `search "${term.replaceAll('"', '')}"; fields name,first_release_date,cover.image_id,genres.name,game_modes.name,involved_companies.developer,involved_companies.company.name; limit 3;`,
})
if (!res.ok) {
  console.log(`IGDB recusou: HTTP ${res.status} ${await res.text()}`)
  process.exit(1)
}
for (const g of await res.json()) {
  const year = g.first_release_date ? new Date(g.first_release_date * 1000).getUTCFullYear() : 'sem ano'
  const dev = g.involved_companies?.find((c) => c.developer)?.company?.name ?? 'sem estúdio'
  console.log(`- ${g.name} (${year}), ${dev}`)
  console.log(`  gêneros: ${g.genres?.map((x) => x.name).join(', ') ?? '-'} | modos: ${g.game_modes?.map((x) => x.name).join(', ') ?? '-'}`)
  console.log(`  capa: ${g.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg` : 'sem capa'}`)
}

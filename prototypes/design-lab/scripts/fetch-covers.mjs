// Downloads Steam artwork for the prototype's mock games into public/covers (git-ignored).
// Usage: node scripts/fetch-covers.mjs
import { mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ids = [
  1426210, 2001120, 739630, 413150, 728880, 620, 1222700, 1966720, 892970, 322330,
  648800, 548430, 105600, 268910, 1225570, 1172620, 242760, 1326470, 1086940, 1145360,
  367520, 3527290, 3241660, 865360, 1435790, 341800, 996770, 1599600, 477160, 2881650,
  1621690, 962130, 2567870, 753640, 504230, 1245620,
]
const kinds = { cover: 'library_600x900.jpg', hero: 'library_hero.jpg', header: 'header.jpg' }
const bases = [
  'https://shared.steamstatic.com/store_item_assets/steam/apps',
  'https://cdn.cloudflare.steamstatic.com/steam/apps',
]
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'covers')
await mkdir(out, { recursive: true })

const exists = (p) => access(p).then(() => true, () => false)

for (const id of ids) {
  const got = []
  for (const [kind, file] of Object.entries(kinds)) {
    const dest = join(out, `${id}-${kind}.jpg`)
    if (await exists(dest)) { got.push(kind); continue }
    for (const base of bases) {
      try {
        const res = await fetch(`${base}/${id}/${file}`)
        if (!res.ok) continue
        await writeFile(dest, Buffer.from(await res.arrayBuffer()))
        got.push(kind)
        break
      } catch { /* try next base */ }
    }
  }
  console.log(id, got.join(',') || 'NONE')
}

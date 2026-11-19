import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { requireViewer } from './viewer'

const TABLES = ['games', 'game_links', 'tags', 'game_tags', 'game_member_state', 'reviews', 'play_sessions', 'session_participants', 'saved_filters', 'activity'] as const
type Row = Record<string, unknown>

/** Everything the signed-in member can read, as the database lets them read it (blind ratings stay blind). */
export type ExportData = Record<(typeof TABLES)[number], Row[]> & { app: string; exportedAt: string; exportedBy: string; members: Row[]; partnerId: string | null }

export async function exportAll(): Promise<ExportData> {
  const { me, partner } = await requireViewer()
  const supabase = await createClient()
  const out = {} as Record<(typeof TABLES)[number], Row[]>
  for (const table of TABLES) {
    const rows: Row[] = []
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase.from(table).select('*').range(from, from + 999)
      if (error) throw new Error(`${table}: ${error.message}`)
      rows.push(...(data as Row[]))
      if ((data?.length ?? 0) < 1000) break
    }
    out[table] = rows
  }
  const { data: members } = await supabase.from('members').select('user_id, slot, display_name, nicknames, use_nicknames, created_at')
  return {
    app: 'Dan & Mah',
    exportedAt: new Date().toISOString(),
    exportedBy: me.userId,
    members: (members ?? []) as Row[],
    partnerId: partner?.userId ?? null,
    ...out,
  }
}

/** A cell that a spreadsheet could take for a formula gets a leading apostrophe. */
function cell(v: unknown): string {
  if (v === null || v === undefined) return ''
  let s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  if (/^[=+\-@\t\r]/.test(s) && typeof v !== 'number') s = `'${s}`
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows: Row[], columns: string[]): string {
  return '﻿' + [columns.join(','), ...rows.map((r) => columns.map((c) => cell(r[c])).join(','))].join('\r\n') + '\r\n'
}

type Data = ExportData

/** One row per game, with each member's own state and rating next to each other. */
export function gamesCsv(d: Data): string {
  const slotOf = new Map(d.members.map((m) => [m.user_id as string, m.slot as number]))
  const names = new Map(d.members.map((m) => [m.slot as number, m.display_name as string]))
  const rows = d.games.map((g) => {
    const row: Row = { ...g }
    for (const slot of [1, 2]) {
      const who = names.get(slot) ?? `socio${slot}`
      const st = d.game_member_state.find((s) => s.game_id === g.id && slotOf.get(s.user_id as string) === slot)
      const rv = d.reviews.find((s) => s.game_id === g.id && slotOf.get(s.user_id as string) === slot)
      row[`${who} situacao`] = st?.status
      row[`${who} quer jogar`] = st?.wants
      row[`${who} tem`] = st?.owned
      row[`${who} zerou em`] = st?.finished_on
      row[`${who} nota`] = rv?.rating
      row[`${who} comentario`] = rv?.comment
    }
    return row
  })
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))]
  return toCsv(rows, columns)
}

/** One row per session, with the game's title and who played. */
export function sessionsCsv(d: Data): string {
  const names = new Map(d.members.map((m) => [m.user_id as string, m.display_name as string]))
  const titles = new Map(d.games.map((g) => [g.id as number, g.title as string]))
  const rows = d.play_sessions.map((s) => ({
    ...s,
    jogo: titles.get(s.game_id as number),
    quem_jogou: d.session_participants.filter((p) => p.session_id === s.id).map((p) => names.get(p.user_id as string) ?? '').join(' + '),
  }))
  return toCsv(rows, ['id', 'played_on', 'jogo', 'quem_jogou', 'minutes', 'note', 'moment', 'game_id', 'created_at'])
}

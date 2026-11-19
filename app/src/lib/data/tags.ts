import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Tag, TagKind } from '@/lib/filters'

export interface SavedFilter { id: number; name: string; query: string }

export async function listTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tags').select('id, kind, name, slug').order('name')
  if (error) throw new Error(error.message)
  return (data ?? []).map((t) => ({ id: t.id, kind: t.kind as TagKind, name: t.name, slug: t.slug }))
}

export async function listSavedFilters(): Promise<SavedFilter[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('saved_filters').select('id, name, query').order('position').order('id')
  if (error) throw new Error(error.message)
  return data ?? []
}

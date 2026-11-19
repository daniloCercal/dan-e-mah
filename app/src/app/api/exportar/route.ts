import { NextResponse, type NextRequest } from 'next/server'
import { getViewer } from '@/lib/data/viewer'
import { exportAll, gamesCsv, sessionsCsv } from '@/lib/data/export'

const FILES = {
  json: ['application/json', 'dan-e-mah-tudo.json'],
  jogos: ['text/csv', 'dan-e-mah-jogos.csv'],
  diario: ['text/csv', 'dan-e-mah-diario.csv'],
} as const

/** Download of everything the signed-in member can see: ?formato=json | jogos | diario. */
export async function GET(request: NextRequest) {
  if (!(await getViewer())) return new NextResponse('Entre para exportar.', { status: 401 })
  const format = request.nextUrl.searchParams.get('formato') ?? 'json'
  if (!(format in FILES)) return new NextResponse('Formato desconhecido.', { status: 400 })
  const [type, filename] = FILES[format as keyof typeof FILES]
  let body: string
  try {
    const data = await exportAll()
    body = format === 'json' ? JSON.stringify(data, null, 2) : format === 'jogos' ? gamesCsv(data) : sessionsCsv(data)
  } catch {
    return new NextResponse('Não deu para exportar agora.', { status: 500 })
  }
  return new NextResponse(body, {
    headers: {
      'Content-Type': `${type}; charset=utf-8`,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}

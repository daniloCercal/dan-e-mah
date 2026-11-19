'use client'

import { useState } from 'react'
import { PairGlyph } from './icons'

interface Props {
  title: string
  src?: string | null
  tilt?: 'a' | 'b'
  eager?: boolean
  /** Set when the title is not printed next to the cover. */
  describe?: boolean
}

/** Keyed by the address so a new cover starts from a clean state. */
export function Cover(props: Props) {
  return <CoverImage key={props.src ?? ''} {...props} />
}

function CoverImage({ title, src, tilt, eager, describe }: Props) {
  const [failed, setFailed] = useState(false)
  const [arrived, setArrived] = useState(false)
  const missing = failed || !src
  // A cached image may already be complete before React attaches onLoad.
  const attach = (el: HTMLImageElement | null) => { if (el?.complete && el.naturalWidth > 0) setArrived(true) }
  return (
    <span className="cover" data-tilt={tilt}>
      {missing ? (
        <span className="cover-missing">
          <PairGlyph size={22} />
          <span className="cover-missing-title">{title}</span>
          <span className="cover-missing-note">Sem capa por enquanto</span>
        </span>
      ) : (
        // Covers come from the catalog CDN or a signed storage address, so next/image does not apply.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={attach} data-arrived={arrived || undefined} onLoad={() => setArrived(true)}
          src={src} alt={describe ? title : ''} width={600} height={900}
          loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}

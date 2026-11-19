'use client'

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { drawCover, type Crop } from '@/lib/media'

const clamp = (v: number) => Math.max(-1, Math.min(1, v))
const VIEW = 240

/** Square crop: drag (or use the arrow keys) to position, slider to zoom. */
export function PhotoEditor({ image, crop, setCrop }: { image: HTMLImageElement; crop: Crop; setCrop: (c: Crop) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number; crop: Crop } | null>(null)

  useEffect(() => {
    if (canvas.current) drawCover(canvas.current, image, VIEW * 2, VIEW * 2, crop)
  }, [image, crop])

  // How far the picture can travel inside the square, in screen pixels, for the current zoom.
  const slack = () => {
    const scale = Math.max(VIEW / image.naturalWidth, VIEW / image.naturalHeight) * crop.zoom
    return { x: (image.naturalWidth * scale - VIEW) / 2, y: (image.naturalHeight * scale - VIEW) / 2 }
  }
  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, crop }
  }
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return
    const s = slack()
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    setCrop({
      zoom: crop.zoom,
      x: s.x > 0.5 ? clamp(drag.current.crop.x - dx / s.x) : 0,
      y: s.y > 0.5 ? clamp(drag.current.crop.y - dy / s.y) : 0,
    })
  }
  const key = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const steps: Record<string, [number, number] | undefined> = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }
    const step = steps[e.key]
    if (!step) return
    e.preventDefault()
    setCrop({ zoom: crop.zoom, x: clamp(crop.x + step[0]), y: clamp(crop.y + step[1]) })
  }

  return (
    <div className="photo-edit">
      <canvas
        ref={canvas} className="photo-canvas" tabIndex={0} role="img"
        aria-label="Prévia da foto. Arraste ou use as setas para posicionar."
        onPointerDown={down} onPointerMove={move} onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)} onKeyDown={key}
      />
      <label className="editor-label" htmlFor="zoom">Aproximar</label>
      <input
        id="zoom" className="slider" type="range" min={1} max={3} step={0.05} value={crop.zoom}
        style={{ ['--fill' as string]: `${((crop.zoom - 1) / 2) * 100}%` }}
        onChange={(e) => setCrop({ ...crop, zoom: Number(e.target.value) })}
      />
      <p className="quiet">Arraste a foto para escolher o que fica no círculo.</p>
    </div>
  )
}

'use client'

export interface Crop { zoom: number; x: number; y: number }

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image failed to load'))
    img.src = src
  })
}

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('file could not be read'))
    reader.readAsDataURL(file)
  })
}

/** Draws `img` covering a w by h box. `zoom` >= 1 enlarges; x and y (-1..1) move inside the slack. */
export function drawCover(canvas: HTMLCanvasElement, img: HTMLImageElement, w: number, h: number, crop: Crop = { zoom: 1, x: 0, y: 0 }) {
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * crop.zoom
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  const dx = (w - dw) / 2 - (crop.x * (dw - w)) / 2
  const dy = (h - dh) / 2 - (crop.y * (dh - h)) / 2
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, dx, dy, dw, dh)
}

export function toJpegBlob(img: HTMLImageElement, size: number, crop: Crop): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  drawCover(canvas, img, size, size, crop)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86))
}

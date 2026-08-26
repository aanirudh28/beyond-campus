/* eslint-disable @typescript-eslint/no-require-imports -- build-time Node script, not bundled */
// Prep raw logos -> transparent-background PNGs for the white-filter logo strip.
// Masking modes:
//   white     — coloured/dark mark on white paper (the common case)
//   card      — mark on a flat solid-colour card; keys out the modal colour
//   whitemark — near-white mark on anything (textured or gradient backdrops)
//   dark      — dark mark on a light backdrop that isn't white (gradients)
// All cropping happens on the raw pixel buffer: sharp runs trim() before extract(), so mixing
// the two in one pipeline blows up with "bad extract area".
const sharp = require('sharp')
const path = require('path')

const SRC = path.join(__dirname, '..', '_raw-logos')
const OUT = path.join(__dirname, '..', 'public', 'logos')

// inset: shave edge artefacts (stray border strips) before masking
// dropTagline: cut a thin band of marks sitting under the main wordmark
const JOBS = [
  { src: 'American Express.png',        out: 'american-express.png', mode: 'card',  tol: 140, inset: 3 },
  { src: 'DE Shaw.png',                 out: 'de-shaw.png',          mode: 'white' },
  // purple gradient card, so key on the white mark rather than the background
  { src: 'District.jpg',                out: 'district.png',         mode: 'whitemark', tol: 150, inset: 3 },
  // textured navy backdrop — distance-from-bg keeps the texture, so keep only the near-white mark
  { src: 'Everest Group.jpg',           out: 'everest-group.png',    mode: 'whitemark', tol: 150, inset: 3 },
  { src: 'Goldman Sachs.png',           out: 'goldman-sachs.png',    mode: 'card',  tol: 120, inset: 3 },
  { src: 'HP.png',                      out: 'hp.png',               mode: 'white' },
  { src: 'HSBC.png',                    out: 'hsbc.png',             mode: 'white' },
  { src: 'IAC.jpg',                     out: 'iac.png',              mode: 'whitemark', tol: 150, inset: 3 },
  { src: 'KPMG.png',                    out: 'kpmg.png',             mode: 'white' },
  { src: 'Kroll.jpg',                   out: 'kroll.png',            mode: 'white' },
  // rainbow gradient backdrop — key on darkness, not on distance from any one colour
  { src: 'Mygate.jpg',                  out: 'mygate.png',           mode: 'dark',  tol: 120, inset: 3 },
  { src: 'Nykaa.jpg',                   out: 'nykaa.png',            mode: 'white' },
  { src: 'PhonePe.png',                 out: 'phonepe.png',          mode: 'white' },
  { src: 'Plum.png',                    out: 'plum.png',             mode: 'white' },
  { src: 'Pocket FM.png',               out: 'pocket-fm.png',        mode: 'white', dropTagline: true },
  { src: 'Redseer Consulting.png',      out: 'redseer.png',          mode: 'white', dropTagline: true },
  { src: 'S&P Global.jpg',              out: 'snp-global.png',       mode: 'white' },
  { src: 'Snabbit.png',                 out: 'snabbit.png',          mode: 'card',  tol: 140, inset: 3 },
  // the tall 't' mark spans the full height, so look for the tagline band right of it only
  { src: 'Takshashila Consulting.png',  out: 'takshashila.png',      mode: 'white', dropTagline: true, bandFromX: 0.3 },
  { src: 'Tata 1MG.png',                out: 'tata-1mg.png',         mode: 'card',  tol: 140, inset: 3 },
  { src: 'Tresvista.png',               out: 'tresvista.png',        mode: 'white', dropTagline: true },
]

const OUT_H = 120 // ~2x the largest render height in the strip

// most common colour, quantised — the card background
function modalColour(data, w, h, ch) {
  const counts = new Map()
  for (let p = 0; p < w * h; p++) {
    const i = p * ch
    const key = (data[i] >> 3) * 1024 + (data[i + 1] >> 3) * 32 + (data[i + 2] >> 3)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  let best = 0, bestN = -1
  for (const [k, n] of counts) if (n > bestN) { bestN = n; best = k }
  return [((best >> 10) & 31) * 8 + 4, ((best >> 5) & 31) * 8 + 4, (best & 31) * 8 + 4]
}

// Compression noise leaves the background a few units off the key colour, which the raw distance
// turns into a faint but very visible haze box once the strip paints it white. Knee it to zero and
// rescale what's left so edges stay soft.
function knee(a, k) {
  return a <= k ? 0 : Math.min(255, Math.round(((a - k) / (255 - k)) * 255))
}

function alphaFor(mode, r, g, b, bg, tol) {
  if (mode === 'white') return knee(Math.max(0, Math.min(255, 255 - Math.min(r, g, b))), 18)
  if (mode === 'dark') {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    return knee(Math.max(0, Math.min(255, Math.round(255 - (lum / (255 - tol)) * 255))), 60)
  }
  if (mode === 'whitemark') {
    const d = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2)
    return knee(Math.max(0, Math.min(255, Math.round(255 - (d / tol) * 255))), 45)
  }
  const d = Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
  return knee(Math.max(0, Math.min(255, Math.round((d / tol) * 255))), 45)
}

// Row bands of opaque content; cut a short trailing band (the tagline).
function taglineCut(alpha, w, h, fromX = 0) {
  const x0 = Math.round(w * fromX)
  const rowHas = []
  for (let y = 0; y < h; y++) {
    let n = 0
    // low threshold: taglines are often pale grey, and the bbox pass keeps anything over 12
    for (let x = x0; x < w; x++) if (alpha[y * w + x] > 14) n++
    rowHas.push(n > (w - x0) * 0.005)
  }
  const bands = []
  let start = null
  for (let y = 0; y < h; y++) {
    if (rowHas[y] && start === null) start = y
    if (!rowHas[y] && start !== null) { bands.push([start, y - 1]); start = null }
  }
  if (start !== null) bands.push([start, h - 1])
  if (bands.length < 2) return h
  const last = bands[bands.length - 1]
  const lastH = last[1] - last[0] + 1
  const mainH = Math.max(...bands.slice(0, -1).map(b => b[1] - b[0] + 1))
  return lastH < mainH * 0.55 && last[0] > 8 ? last[0] : h
}

;(async () => {
  for (const job of JOBS) {
    const raw = await sharp(path.join(SRC, job.src)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const { width: W, height: H, channels: ch } = raw.info
    const ins = job.inset || 0
    const w = W - ins * 2, h = H - ins * 2
    const bg = job.mode === 'card' ? modalColour(raw.data, W, H, ch) : null

    const rgba = Buffer.alloc(w * h * 4)
    const alpha = new Uint8Array(w * h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = ((y + ins) * W + (x + ins)) * ch
        const a = alphaFor(job.mode, raw.data[i], raw.data[i + 1], raw.data[i + 2], bg, job.tol)
        const p = y * w + x
        alpha[p] = a
        rgba[p * 4] = 255; rgba[p * 4 + 1] = 255; rgba[p * 4 + 2] = 255; rgba[p * 4 + 3] = a
      }
    }

    // bounding box of opaque content, minus any tagline band
    const cropH = job.dropTagline ? taglineCut(alpha, w, h, job.bandFromX) : h
    let x0 = w, x1 = -1, y0 = h, y1 = -1
    for (let y = 0; y < cropH; y++) for (let x = 0; x < w; x++) {
      if (alpha[y * w + x] > 12) {
        if (x < x0) x0 = x; if (x > x1) x1 = x
        if (y < y0) y0 = y; if (y > y1) y1 = y
      }
    }
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1
    const box = Buffer.alloc(bw * bh * 4)
    for (let y = 0; y < bh; y++) rgba.copy(box, y * bw * 4, ((y + y0) * w + x0) * 4, ((y + y0) * w + x1 + 1) * 4)

    await sharp(box, { raw: { width: bw, height: bh, channels: 4 } })
      .resize({ height: OUT_H, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, job.out))
    console.log(job.out.padEnd(22), `${bw}x${bh}`, 'ratio', (bw / bh).toFixed(2),
      bg ? 'bg ' + bg.join(',') : '', cropH < h ? `(tagline cut at ${cropH}/${h})` : '')
  }
})()

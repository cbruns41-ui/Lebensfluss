import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

/** Lebensfluss: Flusswelle + Lebenspunkt — identisch zu LogoMark / favicon.svg */
function graphicElements() {
  return `
  <path d="M10 62 C 24 48, 34 74, 48 56 S 72 42, 90 50" fill="none" stroke="url(#wave)" stroke-width="6.5" stroke-linecap="round" opacity="0.25"/>
  <path d="M12 58 C 28 42, 38 72, 52 52 S 78 38, 88 48" fill="none" stroke="url(#wave)" stroke-width="7" stroke-linecap="round"/>
  <path d="M12 58 C 28 42, 38 72, 52 52 S 78 38, 88 48" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
  <circle cx="52" cy="52" r="11" fill="#ecfdf5" opacity="0.2"/>
  <circle cx="52" cy="52" r="9" fill="#ecfdf5"/>
  <circle cx="52" cy="52" r="4.5" fill="#10b981"/>
  <circle cx="50" cy="50" r="1.8" fill="#ffffff" opacity="0.85"/>`
}

function defs() {
  return `
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="40%" stop-color="#064e3b"/>
      <stop offset="75%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="wave" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#d1fae5"/>
      <stop offset="45%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#5eead4"/>
    </linearGradient>
    <radialGradient id="glow" cx="52%" cy="48%" r="45%">
      <stop offset="0%" stop-color="#6ee7b7" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
  </defs>`
}

const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">
  ${defs()}
  <rect width="100" height="100" rx="22" fill="url(#bg)"/>
  <rect width="100" height="100" rx="22" fill="url(#glow)"/>
  ${graphicElements()}
</svg>`

/** Maskable: Inhalt auf 72 % skaliert, damit Android-Kreise nichts abschneiden */
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">
  ${defs()}
  <rect width="100" height="100" fill="#0f172a"/>
  <g transform="translate(14, 14) scale(0.72)">
    <rect width="100" height="100" rx="22" fill="url(#bg)"/>
    <rect width="100" height="100" rx="22" fill="url(#glow)"/>
    ${graphicElements()}
  </g>
</svg>`

async function renderPng(svg, size) {
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()
}

const outputs = [
  { file: 'pwa-192.png', svg: standardSvg, size: 192 },
  { file: 'pwa-512.png', svg: standardSvg, size: 512 },
  { file: 'pwa-512-maskable.png', svg: maskableSvg, size: 512 },
  { file: 'apple-touch-icon.png', svg: standardSvg, size: 180 },
]

for (const { file, svg, size } of outputs) {
  const buf = await renderPng(svg, size)
  writeFileSync(join(publicDir, file), buf)
  console.log(`Created ${file} (${size}×${size})`)
}
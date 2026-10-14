// Textura de grano de película encima de las fotos (adorno).
export default function Grano() {
  return (
    <svg className="grano" aria-hidden="true">
      <filter id="filtro-grano">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#filtro-grano)" />
    </svg>
  )
}

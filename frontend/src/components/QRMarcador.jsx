import { MODULOS_QR } from '../data/qrMarcador.js'

// Dibujo de relleno con forma de QR. La imagen real del QR va a venir de otra parte del equipo.
export default function QRMarcador({ lado = 166 }) {
  return (
    <svg
      viewBox="0 0 25 25"
      width={lado}
      height={lado}
      role="img"
      aria-label="Marcador de código QR"
      shapeRendering="crispEdges"
    >
      <rect width="25" height="25" fill="#F4F1E8" />
      <g fill="#0A0A0A">
        <path fillRule="evenodd" d="M0 0h7v7H0z M1 1v5h5V1z" />
        <rect x="2" y="2" width="3" height="3" />
        <path fillRule="evenodd" d="M18 0h7v7h-7z M19 1v5h5V1z" />
        <rect x="20" y="2" width="3" height="3" />
        <path fillRule="evenodd" d="M0 18h7v7H0z M1 19v5h5v-5z" />
        <rect x="2" y="20" width="3" height="3" />
        <path d={MODULOS_QR} />
      </g>
    </svg>
  )
}

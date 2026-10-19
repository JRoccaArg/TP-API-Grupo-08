import { QRCodeSVG } from 'qrcode.react'
import { urlVerificacion } from '../utils/verificacion.js'

// QR real de una entrada. Guarda el link de verificación con el código único de esa entrada (el que generó el back al comprar).
export default function CodigoQR({ codigoQr, lado = 166 }) {
  return (
    <QRCodeSVG
      value={urlVerificacion(codigoQr)}
      size={lado}
      level="M"
      bgColor="#F4F1E8"
      fgColor="#0A0A0A"
      role="img"
      aria-label="Código QR de la entrada"
    />
  )
}

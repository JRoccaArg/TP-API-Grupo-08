// "After Palace" -> "after-palace" (sin tildes ni espacios), para el nombre del archivo.
const sinEspacios = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Nombre del archivo que se descarga: "zenoir-after-palace-6f9984a5.png".
export const nombreArchivo = (titulo, codigoQr) => `zenoir-${sinEspacios(titulo)}-${codigoQr.slice(0, 8)}.png`

const SIN_COMPARTIR = 'Tu navegador no permite compartir imágenes: descargá la entrada y mandala.'

// Abre el menú de compartir del celular (WhatsApp, mail, etc.) con la imagen del QR (Web Share API: navigator.share).
// Devuelve el mensaje que hay que mostrar, o '' si se compartió o la persona cerró el menú.
export function compartirImagen(png, nombre, texto) {
  if (!navigator.share || !navigator.canShare) return Promise.resolve(SIN_COMPARTIR)
  return fetch(png)
    .then((respuesta) => respuesta.blob())
    .then((imagen) => {
      const archivo = new File([imagen], nombre, { type: 'image/png' })
      if (!navigator.canShare({ files: [archivo] })) return SIN_COMPARTIR
      return navigator.share({ files: [archivo], title: texto, text: texto }).then(() => '')
    })
    .catch((fallo) => (fallo.name === 'AbortError' ? '' : 'No se pudo compartir la entrada. Probá descargarla.'))
}

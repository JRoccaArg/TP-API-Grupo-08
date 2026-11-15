// "After Palace" -> "after-palace" (sin tildes ni espacios), para el nombre del archivo.
const sinEspacios = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Nombre del archivo que se descarga: "zenoir-after-palace-6f9984a5.png".
export const nombreArchivo = (titulo, codigoQr) => `zenoir-${sinEspacios(titulo)}-${codigoQr.slice(0, 8)}.png`

const SIN_COMPARTIR = 'Tu navegador no permite compartir imágenes: descargá la entrada y mandala.'

// La imagen sale del canvas como texto ("data:image/png;base64,..."): se pasa a bytes para armar el archivo, sin pedir nada.
const archivoDesdePng = (png, nombre) => {
  const bytes = Uint8Array.from(atob(png.split(',')[1]), (letra) => letra.charCodeAt(0))
  return new File([bytes], nombre, { type: 'image/png' })
}

// Abre el menú de compartir del celular (WhatsApp, mail, etc.) con la imagen del QR (Web Share API: navigator.share).
// Devuelve el mensaje que hay que mostrar, o '' si se compartió o la persona cerró el menú.
export function compartirImagen(png, nombre, texto) {
  if (!navigator.share || !navigator.canShare) return Promise.resolve(SIN_COMPARTIR)
  const archivo = archivoDesdePng(png, nombre)
  if (!navigator.canShare({ files: [archivo] })) return Promise.resolve(SIN_COMPARTIR)
  return navigator.share({ files: [archivo], title: texto, text: texto })
    .then(() => '')
    .catch((fallo) => (fallo.name === 'AbortError' ? '' : 'No se pudo compartir la entrada. Probá descargarla.'))
}

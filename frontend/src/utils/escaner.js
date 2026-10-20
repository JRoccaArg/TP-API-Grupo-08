// Ayudas del escáner de QR del admin.

// El QR guarda un link como "http://.../verificar/<código>": de ahí sale el código. Si el texto no es un link,
// se toma como código tal cual (por ejemplo, un QR viejo que solo tiene el código).
export function codigoDesdeQr(texto) {
  const limpio = texto.trim()
  const partes = limpio.split('/verificar/')
  if (partes.length < 2) return limpio
  return decodeURIComponent(partes[1].split(/[?#/]/)[0])
}

// Qué decirle al admin si no se puede abrir la cámara (el tipo de error lo informa el escáner).
const MENSAJES_CAMARA = {
  'permission-denied': 'No diste permiso para usar la cámara. Habilitalo desde el candado de la barra de direcciones y recargá.',
  'no-camera': 'No encontramos una cámara en este dispositivo.',
  'in-use': 'La cámara la está usando otra aplicación. Cerrala y recargá la página.',
  'insecure-context': 'El navegador solo abre la cámara en una dirección segura (https) o en localhost.',
  unsupported: 'Este navegador no permite usar la cámara. Probá con Chrome o con la cámara del celular.',
}

export const mensajeDeCamara = (error) => MENSAJES_CAMARA[error?.kind] || 'No se pudo abrir la cámara. Probá recargar la página.'

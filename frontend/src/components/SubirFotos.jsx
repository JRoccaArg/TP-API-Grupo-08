import Icono from './Icono.jsx'

const MAXIMO_MB = 10

// Caja para elegir varias fotos a la vez. Revisa que sean imágenes y que no pesen de más; avisa con onElegir(archivos) o onError(mensaje).
export default function SubirFotos({ ocupado, onElegir, onError }) {
  const elegir = (cambio) => {
    const archivos = Array.from(cambio.target.files)
    cambio.target.value = '' // así se puede volver a elegir el mismo archivo
    if (!archivos.length) return
    const invalida = archivos.find((archivo) => !archivo.type.startsWith('image/') || archivo.size > MAXIMO_MB * 1024 * 1024)
    if (invalida) {
      onError(`"${invalida.name}" no es una imagen o pesa más de ${MAXIMO_MB} MB.`)
      return
    }
    onElegir(archivos)
  }

  return (
    <label className={`subida__caja fotos-admin__subir ${ocupado ? 'fotos-admin__subir--ocupado' : ''}`}>
      <input type="file" accept="image/*" multiple disabled={ocupado} onChange={elegir} />
      <Icono nombre="subir" tamano={30} grosor={1.5} />
      <strong>{ocupado ? 'Guardando…' : 'Subí fotos'}</strong>
      <p>Podés elegir varias a la vez. JPG, PNG o WEBP de hasta {MAXIMO_MB} MB.</p>
    </label>
  )
}

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner'
import AvisoAcceso from '../components/AvisoAcceso.jsx'
import Boton from '../components/Boton.jsx'
import TituloAdmin from '../components/TituloAdmin.jsx'
import { codigoDesdeQr, mensajeDeCamara } from '../utils/escaner.js'

// Pantalla "/admin/:id/escanear": abre la cámara para leer el QR de las entradas del evento. Solo ADMIN.
// Al leer un QR pasa a /verificar/<código> avisando de qué evento viene, para marcar si la entrada es de otro y ofrecer escanear la siguiente.
export default function EscanearQR({ usuario }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  if (usuario?.rol !== 'ADMIN') {
    return <AvisoAcceso usuario={usuario} para="ADMIN" sinSesion="Esta sección es solo para administradores." />
  }

  const leer = (codigos) => {
    const codigo = codigoDesdeQr(codigos[0]?.rawValue || '')
    if (codigo) navigate(`/verificar/${encodeURIComponent(codigo)}`, { state: { eventoId: Number(id), volverA: `/admin/${id}/escanear` } })
  }

  return (
    <main className="pagina admin">
      <TituloAdmin
        migas={[{ texto: 'Gestionar eventos', ruta: '/admin' }, { texto: 'Resumen del evento', ruta: `/admin/${id}` }, { texto: 'Escanear QR' }]}
        titulo="Escanear"
        resaltado="QR"
        bajada="Apuntá la cámara al QR de la entrada: se lee solo y se abre la verificación."
      />
      <div className="escaner">
        <Scanner onScan={leer} onError={(fallo) => setError(mensajeDeCamara(fallo))} formats={['qr_code']} sound={false} />
      </div>
      {error && <p className="admin__aviso admin__aviso--error" role="alert">{error}</p>}
      <div className="escaner__acciones">
        <Boton to={`/admin/${id}`} variante="contorno" clase="boton--chico">Volver al resumen</Boton>
      </div>
    </main>
  )
}

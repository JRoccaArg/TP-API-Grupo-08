import { useEffect, useState } from 'react'
import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import TarjetaEntrada from '../components/TarjetaEntrada.jsx'
import { obtenerMisCompras } from '../utils/apiCompras.js'
import { obtenerEventosPorId } from '../utils/apiEventos.js'
import { entradasDeCompras, idsDeEventosDeCompras } from '../utils/compras.js'

// Pantalla "/mis-entradas": las entradas de todas las compras del usuario, con su QR.
export default function MisEntradas({ usuario }) {
  const token = usuario?.rol === 'USER' ? usuario.token : null
  const [compras, setCompras] = useState(null) // null mientras se piden
  const [eventos, setEventos] = useState(null) // { id: evento } de cada entrada
  const [error, setError] = useState('')
  const [reintento, setReintento] = useState(0)

  useEffect(() => {
    if (!token) return undefined
    let activo = true
    obtenerMisCompras(token)
      .then((lista) => { if (activo) setCompras(lista) })
      .catch((fallo) => { if (activo) setError(fallo.message) })
    return () => { activo = false }
  }, [token, reintento])

  useEffect(() => {
    if (!compras) return undefined
    let activo = true
    obtenerEventosPorId(idsDeEventosDeCompras(compras)).then((pedidos) => { if (activo) setEventos(pedidos) })
    return () => { activo = false }
  }, [compras])

  if (!token) return <Aviso mensaje="Ingresá para ver tus entradas." boton="Ingresar" to="/login" />
  if (error) {
    return (
      <main className="pagina aviso">
        <h1 className="aviso__mensaje">No pudimos cargar tus entradas.</h1>
        <p role="alert">{error}</p>
        <Boton onClick={() => { setError(''); setReintento(reintento + 1) }}>Reintentar</Boton>
      </main>
    )
  }
  if (!compras || !eventos) {
    return <main className="pagina compra"><p className="admin__cargando" role="status">Cargando tus entradas…</p></main>
  }
  const entradas = entradasDeCompras(compras)
  if (entradas.length === 0) return <Aviso mensaje="Todavía no compraste entradas." boton="Ver fechas" to="/" />

  return (
    <div className="fondo-dorado">
      <main className="pagina mis-entradas">
        <div className="mis-entradas__cabecera">
          <div>
            <p className="rotulo-oro aparece">TUS COMPRAS</p>
            <h1 className="titulo-grande aparece">
              Tus <span className="oro-texto">entradas</span>
            </h1>
            <p className="mis-entradas__bajada">Mostrá el QR en la puerta: cada código se usa una sola vez.</p>
          </div>
          <Boton to="/" variante="contorno" clase="boton--chico">
            Volver al inicio
          </Boton>
        </div>
        <div className="mis-entradas__grilla">
          {entradas.map((entrada, indice) => (
            <TarjetaEntrada
              key={entrada.id}
              entrada={entrada}
              evento={eventos[entrada.eventoId]}
              comprador={usuario.nombre}
              numero={indice + 1}
              total={entradas.length}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

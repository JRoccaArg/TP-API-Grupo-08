import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import ResultadoVerificacion from '../components/ResultadoVerificacion.jsx'
import { consultarTicket, utilizarTicket } from '../utils/apiTickets.js'
import { datosDeTicket, resultadoDeTicket } from '../utils/verificacion.js'

// Pantalla "/verificar/:codigo": a donde lleva el QR de una entrada. Solo la puede ver el organizador (ADMIN).
// Al abrirla se consulta la entrada sin gastarla: el ingreso se registra recién al apretar el botón.
// Si se llega desde el escáner, "state" trae el evento que se controla y a dónde volver para escanear la siguiente.
export default function VerificarEntrada({ usuario }) {
  const { codigo } = useParams()
  const { pathname, state } = useLocation()
  const volverA = state?.volverA
  const token = usuario?.rol === 'ADMIN' ? usuario.token : null
  const [consulta, setConsulta] = useState(null) // { codigo, ticket, registrado } o { codigo, error }
  const [enviando, setEnviando] = useState(false)
  const [errorRegistro, setErrorRegistro] = useState('')
  const [reintento, setReintento] = useState(0)

  useEffect(() => {
    if (!token) return undefined
    let activo = true
    consultarTicket(token, codigo)
      .then((ticket) => { if (activo) setConsulta({ codigo, ticket }) })
      .catch((fallo) => { if (activo) setConsulta({ codigo, error: fallo }) })
    return () => { activo = false }
  }, [token, codigo, reintento])

  const registrar = () => {
    setEnviando(true)
    setErrorRegistro('')
    utilizarTicket(token, codigo)
      .then((ticket) => {
        setConsulta({ codigo, ticket, registrado: true })
        setEnviando(false)
      })
      .catch((fallo) => {
        setEnviando(false)
        // 409: alguien la usó mientras tanto. Se vuelve a consultar para mostrar que ya está usada.
        if (fallo.estado === 409) setReintento(reintento + 1)
        else setErrorRegistro(fallo.message)
      })
  }

  if (!usuario) {
    return <Aviso mensaje="Ingresá como organizador para verificar esta entrada." boton="Ingresar" to="/login" state={{ volverA: pathname }} />
  }
  if (!token) return <Aviso mensaje="Solo el organizador puede verificar entradas." boton="Ir al inicio" to="/" />

  const actual = consulta?.codigo === codigo ? consulta : null // si cambió el código, lo anterior ya no vale
  if (!actual) return <main className="pagina compra"><p className="admin__cargando" role="status">Verificando entrada…</p></main>

  if (actual.error) {
    const noExiste = actual.error.estado === 404
    return (
      <ResultadoVerificacion
        valido={false}
        titulo={noExiste ? 'Entrada no válida' : 'No pudimos verificar la entrada'}
        mensaje={noExiste ? 'Este código no corresponde a ninguna entrada de Zenoir.' : actual.error.message}
        volverA={volverA}
      >
        {!noExiste && <Boton onClick={() => setReintento(reintento + 1)} clase="boton--grande">Reintentar</Boton>}
      </ResultadoVerificacion>
    )
  }

  const { ticket, registrado } = actual
  const resultado = resultadoDeTicket(ticket, registrado, state?.eventoId)
  return (
    <ResultadoVerificacion {...resultado} datos={datosDeTicket(ticket)} volverA={volverA}>
      {resultado.valido && ticket.estado === 'EMITIDO' && (
        <>
          <Boton onClick={registrar} deshabilitado={enviando} clase="boton--grande">
            {enviando ? 'Registrando...' : 'Registrar ingreso'}
          </Boton>
          {errorRegistro && <p className="verificacion__error" role="alert">{errorRegistro}</p>}
        </>
      )}
    </ResultadoVerificacion>
  )
}

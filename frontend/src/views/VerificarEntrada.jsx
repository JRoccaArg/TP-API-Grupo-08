import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import ResultadoVerificacion from '../components/ResultadoVerificacion.jsx'
import { consultarTicket, utilizarTicket } from '../redux/ticketsSlice'
import { datosDeTicket, resultadoDeTicket } from '../utils/verificacion.js'

// Pantalla "/verificar/:codigo": a donde lleva el QR de una entrada. Solo la puede ver el organizador (ADMIN).
// La "key" hace que cada código empiece de cero (por ejemplo, al escanear la siguiente entrada).
export default function VerificarEntrada({ usuario }) {
  const { codigo } = useParams()
  return <Verificacion key={codigo} codigo={codigo} usuario={usuario} />
}

// Al abrirla se consulta la entrada sin gastarla: el ingreso se registra recién al apretar el botón.
// Si se llega desde el escáner, "state" trae el evento que se controla y a dónde volver para escanear la siguiente.
function Verificacion({ codigo, usuario }) {
  const { pathname, state } = useLocation()
  const dispatch = useDispatch()
  const { ticket, loading, error, registrando, errorRegistro, ultimoRegistrado } = useSelector((estado) => estado.tickets)
  const [pidioRegistrar, setPidioRegistrar] = useState(false)
  const volverA = state?.volverA
  const token = usuario?.rol === 'ADMIN' ? usuario.token : null
  // Lo guardado vale solo si es de este código: es la idea de meta.arg de la profe (no se vuelve a pedir la misma)
  const actual = ticket?.codigoQr === codigo ? ticket : null
  const fallo = error?.codigo === codigo ? error : null

  useEffect(() => {
    if (token && !actual && !fallo && !loading) dispatch(consultarTicket({ token, codigo }))
  }, [dispatch, token, codigo, actual, fallo, loading])

  const consultar = () => dispatch(consultarTicket({ token, codigo }))
  const registrar = () => {
    setPidioRegistrar(true)
    dispatch(utilizarTicket({ token, codigo }))
  }

  if (!usuario) {
    return <Aviso mensaje="Ingresá como organizador para verificar esta entrada." boton="Ingresar" to="/login" state={{ volverA: pathname }} />
  }
  if (!token) return <Aviso mensaje="Solo el organizador puede verificar entradas." boton="Ir al inicio" to="/" />

  if (fallo) {
    return (
      <ResultadoVerificacion
        valido={false}
        titulo={fallo.noExiste ? 'Entrada no válida' : 'No pudimos verificar la entrada'}
        mensaje={fallo.noExiste ? 'Este código no corresponde a ninguna entrada de Zenoir.' : fallo.mensaje}
        volverA={volverA}
      >
        {!fallo.noExiste && <Boton onClick={consultar} clase="boton--grande">Reintentar</Boton>}
      </ResultadoVerificacion>
    )
  }
  if (!actual) return <main className="pagina compra"><p className="admin__cargando" role="status">Verificando entrada…</p></main>

  // "Ingreso registrado" solo si lo registró esta pantalla: si se vuelve a escanear la misma entrada, figura como ya usada
  const registrado = pidioRegistrar && ultimoRegistrado === codigo
  // Si registrar falló (por ejemplo, la usaron en otra puerta), se avisa en rojo con el mensaje del back y se puede volver a consultar
  const falloRegistro = pidioRegistrar && errorRegistro
  const resultado = falloRegistro
    ? { valido: false, titulo: 'No se pudo registrar el ingreso', mensaje: errorRegistro }
    : resultadoDeTicket(actual, registrado, state?.eventoId)
  return (
    <ResultadoVerificacion {...resultado} datos={datosDeTicket(actual)} volverA={volverA}>
      {falloRegistro ? (
        <Boton onClick={consultar} clase="boton--grande">Consultar de nuevo</Boton>
      ) : resultado.valido && actual.estado === 'EMITIDO' && (
        <Boton onClick={registrar} deshabilitado={registrando} clase="boton--grande">
          {registrando ? 'Registrando...' : 'Registrar ingreso'}
        </Boton>
      )}
    </ResultadoVerificacion>
  )
}

import Aviso from '../components/Aviso.jsx'
import Boton from '../components/Boton.jsx'
import TarjetaEntrada from '../components/TarjetaEntrada.jsx'
import { eventos } from '../data/eventos.js'

// Pantalla "/mis-entradas": las entradas compradas, con su QR.
export default function MisEntradas({ usuario, entradas }) {
  if (usuario?.rol !== 'USER') {
    return <Aviso mensaje="Ingresá para ver tus entradas." boton="Ingresar" to="/login" />
  }

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
            evento={eventos.find((evento) => evento.id === entrada.eventoId)}
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

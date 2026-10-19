import Boton from './Boton.jsx'
import Icono from './Icono.jsx'
import PasosCompra from './PasosCompra.jsx'

// Pantalla que reemplaza al pago cuando se termina el tiempo: las entradas ya se liberaron.
export default function TiempoAgotado() {
  return (
    <main className="pagina compra">
      <PasosCompra paso={3} />
      <div className="reserva reserva--urgente" role="timer" aria-label="Tiempo restante para pagar">
        <p>Se terminó el tiempo para completar el pago.</p>
        <strong className="reserva__tiempo">00:00</strong>
      </div>
      <section className="agotado aparece" role="alertdialog" aria-labelledby="titulo-agotado">
        <span className="agotado__icono">
          <Icono nombre="reloj" tamano={30} />
        </span>
        <h1 id="titulo-agotado">Se terminó el tiempo</h1>
        <p>Liberamos tus entradas para que otras personas puedan comprarlas. Tu carrito quedó vacío.</p>
        <p className="agotado__nota">No se hizo ningún cobro. Podés volver a elegir tus entradas.</p>
        <div className="agotado__botones">
          <Boton to="/#fechas">Ver fechas</Boton>
          <Boton to="/" variante="contorno">
            Ir al inicio
          </Boton>
        </div>
      </section>
    </main>
  )
}

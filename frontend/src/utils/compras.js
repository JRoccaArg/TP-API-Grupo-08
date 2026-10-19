// Compra simulada: arma lo que después va a devolver el backend (POST /compras).
// Un item de "entradas" tiene la misma forma que las de data/entradasCompradas.js.
const codigoAlAzar = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0')

export const crearCompra = (lineas, numero, primerId) => {
  const entradas = []
  let total = 0
  lineas.forEach((linea) => {
    total += linea.subtotal
    for (let i = 0; i < linea.cantidad; i++) {
      entradas.push({
        id: primerId + entradas.length,
        eventoId: linea.evento.id,
        tipo: linea.oferta.tipoEntradaNombre,
        estado: 'EMITIDO',
        codigoQr: `${codigoAlAzar()}-demo`,
      })
    }
  })
  return { numero, total, entradas }
}

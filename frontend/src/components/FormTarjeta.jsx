import Boton from './Boton.jsx'
import CampoLinea from './CampoLinea.jsx'
import { agruparNumero, formatearVencimiento } from '../utils/tarjeta.js'

// Los cuatro campos de la tarjeta. No guarda nada: recibe los datos y los errores ya calculados.
// "onCambiar(campo, texto)" avisa lo escrito; "onFoco(campo)" y "onSalir(campo)" avisan dónde está el cursor.
export default function FormTarjeta({ tarjeta, errores, onCambiar, onFoco, onSalir, onProbar }) {
  const propiedades = (campo) => ({
    nombre: campo,
    onChange: (evento) => onCambiar(campo, evento.target.value),
    onFocus: () => onFoco(campo),
    onBlur: () => onSalir(campo),
    error: errores[campo],
  })

  return (
    <div className="form-tarjeta">
      <CampoLinea
        etiqueta="NÚMERO DE TARJETA"
        valor={agruparNumero(tarjeta.numero)}
        placeholder="0000 0000 0000 0000"
        inputMode="numeric"
        autoComplete="cc-number"
        {...propiedades('numero')}
      />
      <CampoLinea
        etiqueta="NOMBRE EN LA TARJETA"
        valor={tarjeta.nombre}
        placeholder="Como figura en la tarjeta"
        autoComplete="cc-name"
        {...propiedades('nombre')}
      />
      <div className="form-tarjeta__fila">
        <CampoLinea
          etiqueta="VENCIMIENTO"
          valor={formatearVencimiento(tarjeta.vencimiento)}
          placeholder="MM/AA"
          inputMode="numeric"
          autoComplete="cc-exp"
          {...propiedades('vencimiento')}
        />
        <CampoLinea
          etiqueta="CVV"
          tipo="password"
          valor={tarjeta.cvv}
          placeholder="123"
          inputMode="numeric"
          autoComplete="cc-csc"
          {...propiedades('cvv')}
        />
      </div>
      <Boton variante="contorno" clase="boton--chico form-tarjeta__prueba" onClick={onProbar}>
        Usar tarjeta de prueba
      </Boton>
    </div>
  )
}

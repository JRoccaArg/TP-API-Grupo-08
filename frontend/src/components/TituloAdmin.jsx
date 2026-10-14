import { Link } from 'react-router-dom'

// Encabezado de las pantallas de administración: migas de pan, título y una bajada opcional.
export default function TituloAdmin({ migas = [], titulo, resaltado, bajada }) {
  return (
    <div>
      {migas.length > 0 && (
        <p className="migas">
          {migas.map((miga, indice) => (
            <span key={miga.texto}>
              {indice > 0 && <i>/</i>}
              {miga.ruta ? <Link to={miga.ruta}>{miga.texto}</Link> : miga.texto}
            </span>
          ))}
        </p>
      )}
      <h1 className="titulo-grande aparece">
        {titulo} <span className="oro-texto">{resaltado}</span>
      </h1>
      {bajada && <p className="admin__bajada aparece">{bajada}</p>}
    </div>
  )
}

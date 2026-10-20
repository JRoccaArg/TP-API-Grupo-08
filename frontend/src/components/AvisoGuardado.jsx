import { useLocation } from 'react-router-dom'

// Confirmación que trae la pantalla anterior al volver después de guardar o eliminar algo
// (viaja en el "state" del link, por ejemplo: navigate('/admin', { state: { aviso: 'Guardaste...' } })).
export default function AvisoGuardado() {
  const { state } = useLocation()
  if (!state?.aviso) return null
  return <p className="admin__aviso admin__aviso--ok" role="status">{state.aviso}</p>
}

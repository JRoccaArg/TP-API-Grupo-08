// ¿El enlace corresponde a la pantalla actual? "activaEn" amplía la zona activa y "excluye" la recorta
// (por ejemplo, "Gestionar eventos" vive en /admin pero no en /admin/locaciones).
export const estaActivo = (enlace, pathname) => {
  if (enlace.excluye?.some((ruta) => pathname.startsWith(ruta))) return false
  if (enlace.activaEn) return pathname.startsWith(enlace.activaEn)
  if (enlace.ancla) return false
  return enlace.ruta === '/' ? pathname === '/' : pathname.startsWith(enlace.ruta)
}

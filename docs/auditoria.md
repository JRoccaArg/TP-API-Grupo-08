# Auditoría funcional (20/10/2026)

Se probaron los flujos principales contra el back y el front corriendo (API con scripts y pantallas en el navegador), sin leer todo el código. **Solo se tomó nota: no se corrigió nada de lo que figura acá.** Los datos de prueba (usuarios `*@test.local`, eventos "ZZ …", compras, carritos) se borraron al terminar y la base quedó igual que antes (mismo stock en todas las entradas).

Resultado general: **no apareció ningún error que rompa un flujo principal**. Lo que sigue son detalles, validaciones que faltan y mejoras de experiencia, ordenados por importancia.

## Hallazgos

| # | Gravedad | Dónde | Qué pasa | Cómo verlo |
|---|---|---|---|---|
| 1 | Media | Back | Los textos demasiado largos dan **500 Internal Server Error** en lugar de un 400 con mensaje: título de evento, nombre de locación, de tipo de entrada y de categoría (más de 255 caracteres), y nombre o email en el registro. | `POST /eventos` con un título de 400 caracteres. |
| 2 | Media | Front | Con un **token que el back rechaza** (por ejemplo, si el back se reinició con otra clave) la web sigue mostrando al usuario como logueado. Las pantallas dicen "Tu sesión venció… Volvé a ingresar" pero solo ofrecen "Reintentar" (no cierra la sesión ni lleva al login) y el carrito muestra 0 sin avisar. | Cambiar el final del token en `localStorage` y abrir "Mis entradas". |
| 3 | Media | Back | Los eventos **BORRADOR son visibles para cualquiera** por la API: `GET /eventos/{id}` y `GET /eventos` (sin `catalogo=true`) los devuelven sin sesión. La web los oculta, pero quien conozca el id los ve. | `GET /eventos/{id}` de un borrador, sin token. |
| 4 | Baja-media | Back | El registro **no valida el DNI** (acepta "abc" o 30 dígitos), ni la edad (acepta nacidos en 2020 o 1800), ni la contraseña (acepta "x"). El front sí exige una contraseña de 8 a 64 caracteres con requisitos, pero no valida el DNI ni la fecha. | `POST /api/v1/auth/register` con `dni: "abc"`. |
| 5 | Baja | Front | En el registro, un email, DNI o fecha inválidos devuelven el mensaje genérico "Los datos de autenticación son inválidos": no dice qué campo está mal. | Registrarse con una fecha de nacimiento futura. |
| 6 | Baja | Front | Un **administrador** que entra a `/carrito`, `/pago` o `/mis-entradas` ve "Ingresá para ver tu carrito" con un botón "Ingresar", aunque ya está logueado. Pasa algo parecido con un usuario común en `/admin` ("solo para administradores" con botón "Ingresar"). | Entrar como admin a `/carrito`. |
| 7 | Baja | Front | Algunas pantallas muestran el mensaje crudo del back: `/compra/abc` y `/admin/abc` dicen "El parametro 'id' tiene un valor invalido" en vez de "No encontramos…". | Abrir `/compra/abc`. |
| 8 | Baja | Front | "Vaciar carrito" **no pide confirmación** (la acción se hace con un clic y las entradas se liberan). | Botón de la pantalla del carrito. |
| 9 | Baja | Back | Las imágenes no se validan por contenido ni por tamaño: se aceptó un "PNG" que no era una imagen y un archivo de 12 MB (el front dice 10 MB). Solo lo puede subir un admin. | `POST /locaciones/{id}/imagenes`. |
| 10 | Baja | Back | `POST /carritos/activo/items` acepta una cantidad decimal (1.5) y la trunca a 1 sin avisar. | Enviar `cantidad: 1.5`. |
| 11 | Baja | Front | Si el organizador toca el "Ingresar" de la barra superior (en lugar del botón del aviso) en la pantalla de verificación, pierde el destino y cae en `/admin`. | Abrir `/verificar/<código>` sin sesión y tocar el "Ingresar" de arriba. |
| 12 | Baja | Back | El admin puede cargar una entrada con una ventana de venta que termina **después del evento**. Lo protege la verificación de fecha al comprar. | Crear una oferta con fin de venta en 2027 en un evento de 2026. |
| 13 | Baja | Back | `GET /eventosTiposEntrada/{id}/disponibilidad` dice `true` para un evento que ya terminó pero sigue ACTIVO (lo finaliza el proceso programado, que corre cada hora). Apartar entradas sí se rechaza. | Terminar un evento por fecha y consultar la disponibilidad. |
| 14 | Cosmético | Front | El `aria-label` del carrito dice "Carrito: 1 entradas" (plural incorrecto con 1). | Carrito con una sola entrada. |
| 15 | Cosmético | Back/Front | Al elegir otra portada, la nueva queda con orden 2 y la galería con orden 1. No se ve (el front ordena la portada primero). | Hacer portada la segunda foto de un evento. |

## A definir (no son errores)
- **Reembolso con entradas ya usadas:** se reembolsa la compra completa, pero la entrada utilizada no devuelve su stock. Conviene decidir si una compra con una entrada ya usada puede reembolsarse.
- **Borrar un evento con entradas cargadas** (aunque no tenga ventas) da 409 "El evento tiene tipos de entrada asociados": hay que quitar las entradas primero.
- **Fechas:** los eventos devuelven la fecha con zona (`-03:00`) y el carrito y las compras sin zona. El front lo maneja bien.
- **Token:** el JWT dura 24 horas y no hay renovación ni revocación.

## Lo que funcionó como se esperaba
- **Cuentas y permisos:** registro, login (clave mala, usuario inexistente, token falso o alterado), rol siempre USER desde el registro, y 401/403 correctos en todas las rutas de admin y de comprador. El admin no tiene carrito ni compras.
- **Catálogo:** búsqueda (sin tildes, mayúsculas, caracteres especiales e intentos de inyección SQL), categoría, rango de precios (y sus errores), orden, paginación, próximos y ids inválidos.
- **Carrito:** agregar (acumula), cambiar cantidad, quitar y vaciar; las validaciones (cantidad 0, negativa, ausente, texto, de más, oferta pausada o de un evento no activo, ajena); y que el stock se aparte y se devuelva.
- **Pago y compra:** pantalla de pago (formato de tarjeta), iniciar pago sin reiniciar el reloj, total con descuentos y redondeo, un ticket por unidad con QR único, no comprar dos veces el mismo carrito y no leer compras ajenas.
- **Concurrencia:** 6 intentos simultáneos por la última entrada: 1 gana y 5 reciben 409.
- **Vencimiento:** un carrito vencido se abandona en segundos, el stock se libera y la web avisa "Se terminó el tiempo y liberamos tus entradas".
- **Entradas y QR:** Mis entradas (agrupado por evento), descarga, compartir (con aviso si el navegador no puede), verificación del organizador, registrar ingreso y "ya utilizada".
- **Reembolso (cancelado y reprogramado):** compra completa, entradas anuladas con QR sin validez, stock devuelto, doble reembolso, compra ajena y evento activo rechazados.
- **Admin:** crear, editar y borrar eventos (validaciones, lugar y categoría nuevos desde el formulario), entradas del evento (alta, edición, estado), fotos (varias, portada, reorden, archivo no imagen), locaciones, categorías y tipos de entrada con sus duplicados y bloqueos, resumen con estadísticas que coinciden con la base y mover el fin de un evento actualiza el cierre de venta de sus entradas.
- **Integridad de datos:** se revisó la base con 12 controles (stock contra ventas y reservas, tickets contra cantidades, totales, QR duplicados, compras reembolsadas, carritos por usuario, tamaños de imagen, etc.): sin inconsistencias.
- **Tests:** 65 tests del back y 88 del front pasan; el lint y el build también.

## No se pudo probar
- **La cámara del escáner:** el panel del navegador la bloquea. La pantalla carga y muestra el mensaje de permiso, pero no se probó una lectura real (ni la descarga del decodificador desde internet).
- **El proceso programado que finaliza eventos** (corre cada hora): no se esperó a que corriera. Sí se verificó que la compra rechaza un evento terminado.
- **Pantallas de celular:** se dejó de lado a pedido.

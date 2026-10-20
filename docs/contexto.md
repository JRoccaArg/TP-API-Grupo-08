# Contexto

Zenoir es una API para publicar eventos, administrar locaciones, tipos de entrada, compras, tickets e imagenes asociadas a los eventos.

## Estado actual

- El proyecto conecta con SQL Server mediante el perfil `sqlsrv` (por defecto).
- Tambien levanta con el perfil `dev` y una base H2 en memoria.
- Existe registro e inicio de sesion mediante JWT.
- Los usuarios nuevos se registran con el rol `USER`.
- El registro y el inicio de sesion devuelven `access_token` y tambien `role`, `email`, `nombre` y `apellido` (el token solo lleva el email). El front los usa para mostrar el nombre y decidir por rol.
- El front (React) guarda la sesion `{ token, email, nombre, rol }` en `localStorage` (`zenoir.sesion`): sobrevive a recargar la pagina y se descarta si el token ya vencio. Un admin se crea registrando la cuenta y cambiando `rol` a `ADMIN` en la base.
- El panel de administracion del front (`/admin`) ya usa el back real: lista todos los eventos, crea, edita y elimina eventos, y administra sus fotos (subir varias, elegir la portada, reordenar y quitar). El back no obliga a tener una sola portada ni orden unico: el front lo cuida (la portada anterior pasa a `GALERIA` y el orden se numera de 1 en adelante). En la pantalla de edicion de un evento tambien se administran sus entradas (agregar, editar precio/descuento/cupo/fechas/estado y quitar), y `/admin/tipos-entrada` administra los tipos de entrada (nombre y descripcion; ver [[decisiones]]).
- El front tambien administra locaciones (`/admin/locaciones`): lista con su primera foto, crear, editar (nombre y direccion), eliminar y fotos (subir varias, reordenar y quitar; sin portada, solo orden). Eliminar una locacion con eventos devuelve 409 y el front lo avisa. Las locaciones ya no tienen capacidad (ver [[decisiones]]). En el formulario del evento el lugar y la categoria se escriben: si no existen se crean al guardar (un lugar nuevo pide su direccion), y las categorias se administran en `/admin/categorias`. Al entrar a un evento del panel se ve su resumen (`/admin/:id`: ventas, recaudado, compras e ingresos, con `GET /eventos/{id}/estadisticas`) y desde ahi se edita (`/admin/:id/editar`). El carrito y el boton "Ir a pagar" usan el back real (`Sitio.jsx` guarda el carrito y `RutasSitio.jsx` lleva las rutas). El pago (`POST /compras`), la confirmacion (`/compra/:id`) y "Mis entradas" tambien usan el back real; el front ya no tiene datos de ejemplo de eventos, entradas ni compras.
- Los endpoints de autenticacion y las consultas del catalogo son publicos.
- La administracion de eventos, categorias, locaciones, imagenes y tipos de entrada requiere rol `ADMIN`.
- Los carritos requieren rol `USER` y solamente pueden ser utilizados por su propietario.
- Las compras y tickets propios pueden ser consultados por el usuario; los QR se consultan y utilizan con rol `ADMIN`. El QR de cada entrada lleva a `/verificar/<codigoQr>` en el front: el organizador ve a quien pertenece, el evento y la fecha, y registra el ingreso con un boton (ver [[decisiones]]).
- Un evento `ACTIVO` es un evento publicado y a la venta (para prepararlo sin publicar se usa `BORRADOR`, que no aparece en el catalogo). Al llegar su fecha de fin pasa solo a `FINALIZADO`: lo hace un proceso programado (`EventoFinalizacionScheduler`, cada `eventos.finalizacion-ms`, por defecto 1 hora) y, ademas, la compra se frena sola desde esa fecha (`409`, "El evento ya finalizo..."). No se pueden cargar entradas a un evento `FINALIZADO` o `CANCELADO` (`409`).
- Las imagenes de eventos se reciben como archivos multipart y se guardan en la base.
- Los archivos admitidos deben ser imagenes.
- La subida de una imagen devuelve `201 Created` y los listados se ordenan por el campo `orden` de forma ascendente.
- Crear un recurso (evento, locacion, tipo de entrada, categoria, carrito, compra, imagen o usuario) devuelve `201 Created`; los recursos con consulta propia incluyen su ruta en el encabezado `Location`.
- Las imagenes de locaciones tambien se reciben como archivos multipart, se guardan en la base y se ordenan de forma ascendente.
- El registro y el inicio de sesion validan los datos recibidos y devuelven errores controlados.
- Los usuarios guardan nombre, apellido, DNI, fecha de nacimiento, email, password, rol, fecha de registro y estado activo.
- Cada evento pertenece a una categoria y una categoria puede contener varios eventos.
- Al eliminar un evento tambien se eliminan sus imagenes, pero se conserva su categoria.
- Al eliminar una locacion sin eventos tambien se eliminan sus imagenes.
- Una categoria que tiene eventos asociados no puede eliminarse.
- Cada evento puede ofrecer distintos tipos de entrada con precio, descuento, stock y periodo de venta.
- Las entradas se apartan al agregarlas al carrito: se descuentan de `cantidadDisponible` en ese momento y quedan aseguradas hasta que el carrito venza. Si no alcanzan, el `409` dice cual entrada falta y cuantas quedan. Estados del carrito: `ACTIVO` (se esta armando; reloj de armado de `carrito.armado-minutos` = 15 desde la primera entrada, sin renovarse), `EN_PAGO` (el usuario entro a la pantalla de pago con `POST /carritos/activo/iniciar-pago`; reloj de pago nuevo de `carrito.pago-minutos` = 15 desde ese momento), `CONVERTIDO` (pagado) y `ABANDONADO`. Si se vence el tiempo, las entradas vuelven al stock, el carrito queda `ABANDONADO` y se vacian sus items; quitar, bajar la cantidad, vaciar o abandonar tambien las devuelven. Ver [[decisiones]].
- El boton de pagar de la pantalla de pago es `POST /compras` (pago simulado, sin pasarela): exige un carrito `EN_PAGO` vigente, valida el evento y la oferta, genera los tickets y cierra el carrito (`CONVERTIDO`); no vuelve a descontar stock porque ya estaba apartado. Al cancelarse una compra se reponen las entradas sin usar.
- Cada usuario tiene como maximo un carrito abierto (`ACTIVO` o `EN_PAGO`) con sus propios items de entrada; los pagados o abandonados quedan de historial. `GET /carritos/activo` devuelve ese carrito y, si no tiene (nunca armo uno, pago el anterior o se le vencio el tiempo), crea uno vacio: el frontend siempre recibe un carrito. `CarritoResponse` informa `estado`, `fechaVencimiento`, el `precioUnitario` y `subtotal` de cada item y el `total`.
- La compra se hace sobre el carrito abierto del usuario autenticado y no recibe datos en el body. Se rechaza si no tiene uno (o se le vencio el tiempo), si esta vacio o si todavia no entro a la pantalla de pago.
- Agregar, modificar, abandonar, vencer y comprar bloquean temporalmente el stock involucrado para evitar sobreventa por operaciones simultaneas.
- Todas las respuestas de error, salvo 401 y 403 (que son genericas a proposito), traen un `message` con el motivo, incluidos los errores propios de Spring (405, 415, 404 de ruta inexistente, parametro faltante, JSON mal formado).
- Los eventos, tipos de entrada y asociaciones evento-tipo no se eliminan cuando tienen datos relacionados.
- Las locaciones y tipos de entrada validan campos obligatorios, valores positivos y nombres duplicados.

## Decisiones clave

Ver [[decisiones]] y [[arquitectura]].

## Cosas a evitar

- No aceptar el rol enviado por un registro publico.
- No guardar contraseñas sin codificar.
- No incluir claves reales o archivos locales con credenciales en Git.

## Pendiente

- Agregar filtros opcionales al listado de eventos.
- Correr en SQL Server el script del README para el estado `EN_PAGO` (no esta probado en SQL Server, solo en H2).
- Un usuario puede retener entradas hasta armado mas pago (unos 30 minutos); si hace falta un tope menor, ajustar `carrito.armado-minutos` y `carrito.pago-minutos`.
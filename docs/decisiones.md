# Decisiones

## 2026-10-12 - Reserva de entradas en el carrito (15 minutos) y errores con mensaje

**Reserva (se aparta al agregar, con dos relojes).** Agregar una entrada al carrito la descuenta de `cantidadDisponible` en el acto (la oferta pasa a `AGOTADO` al llegar a 0): lo que el usuario puso en el carrito le queda asegurado hasta que el carrito venza. Si no alcanza, responde `409` ahi mismo con el detalle (`No hay stock suficiente de General (Show 1): quedan 3`). El carrito tiene dos estados abiertos:
- `ACTIVO` (armando): `fechaVencimiento` = primera entrada + `carrito.armado-minutos` (15). No se renueva al agregar mas; vuelve a `null` si el carrito se vacia, y la siguiente entrada arranca un reloj nuevo.
- `EN_PAGO` (pantalla de pago): `POST /carritos/activo/iniciar-pago`, que llama el frontend al abrir esa pantalla. Arranca un reloj de pago nuevo: `fechaVencimiento` = ahora + `carrito.pago-minutos` (15), que reemplaza al de armado. Las entradas ya estaban apartadas, asi que solo se revalida que el evento y las ofertas sigan a la venta. Volver a llamarlo (recargar) no reinicia el reloj, para que nadie retenga entradas entrando a pagar una y otra vez. Estando `EN_PAGO` se puede seguir modificando el carrito (aparta o devuelve la diferencia, sin tocar el reloj); si queda vacio vuelve a `ACTIVO`. El tope de retencion de una persona es armado mas pago (unos 30 minutos).

El boton de pagar de esa pantalla es `POST /compras` (pago simulado, sin pasarela): exige un carrito `EN_PAGO` vigente, valida evento y oferta (acepta `AGOTADO`, porque puede estarlo por este mismo carrito), genera los tickets y lo pasa a `CONVERTIDO`, sin descontar stock de nuevo. Un segundo `POST /compras` (doble clic) responde `404`: ya no hay carrito abierto.

Un job (`CarritoVencimientoScheduler`, cada minuto) devuelve las entradas de los carritos abiertos vencidos; ademas, uno vencido que el job todavia no libero se trata como inexistente y se libera al pedir un carrito nuevo. Al vencer o abandonar, el carrito queda `ABANDONADO` y **se vacian sus items** (asi no bloquean el borrado de ofertas). Los `CONVERTIDO` conservan los suyos. Un carrito `ACTIVO` con items y sin vencimiento es anterior a esta logica (nunca aparto stock): se trata como vencido y se abandona sin devolver nada.

Se descuenta el stock real y no se calculan reservas aparte porque `cantidadDisponible` ya es la unica fuente de verdad del catalogo, de `/disponibilidad`, del estado `AGOTADO` y de las validaciones del PATCH de la oferta. Se aparta al agregar (y no al entrar a pagar) porque asi lo pidio la docente ("al agregar entradas al carrito, bloquear ese stock") y porque asegura al usuario que no va a llegar a la pantalla de pago y encontrar que ya no hay entradas; el reloj de pago nuevo es lo habitual en la venta de entradas (el reloj arranca al iniciar el checkout).

**Respuesta del carrito.** `CarritoResponse` trae `estado`, `fechaVencimiento` (hasta cuando estan apartadas las entradas; `null` si el carrito esta vacio) y `total`; cada item trae `precioUnitario` (con el descuento vigente) y `subtotal`, calculados con `PrecioCalculator`, la misma formula de la compra: lo que se muestra es lo que se cobra.

**Estado nuevo en bases existentes.** Se sigue usando la misma base. Hibernate crea un `CHECK` con los valores del enum y `ddl-auto=update` no lo actualiza: en una base de SQL Server ya creada hay que correr una vez el script del README (seccion "Si tu base de SQL Server ya estaba creada"). La columna `fecha_vencimiento` de `Carritos` la agrega Hibernate sola. No esta probado en SQL Server, solo en H2. Una base nueva o el perfil `dev` no necesitan nada.

**Bloqueos.** Orden fijo para evitar deadlocks: usuario, carrito y ofertas ordenadas por id. Al bloquear una oferta se la refresca (`bloquearOferta`): llega ya cargada con los items del carrito y, sin refrescar, el bloqueo devolvia el stock viejo y se perdian devoluciones concurrentes. Lo mismo ocurria en `CompraServiceImpl.cancelar` (6 cancelaciones simultaneas devolvian 5 entradas, sin ningun error): ahora usa el mismo criterio. Un `PessimisticLockingFailureException` (bloqueo no obtenido o deadlock de la base) responde `409` con mensaje para que el cliente reintente.

**Errores.** `ManejadorErrores` extiende `ResponseEntityExceptionHandler`: los errores de Spring MVC (405, 415, parametro faltante o invalido, JSON roto, multipart, ruta inexistente) salen con el mismo formato y un `message`. Lo inesperado responde `500` con un mensaje generico y el detalle solo en el log. 401 y 403 siguen siendo genericos a proposito. La ruta inexistente usa `spring.mvc.throw-exception-if-no-handler-found` y `spring.web.resources.add-mappings=false`, validos mientras el proyecto no sirva recursos estaticos.

**Un carrito por usuario.** Un usuario tiene como maximo un carrito abierto (`ACTIVO` o `EN_PAGO`); los pagados y abandonados quedan de historial (`GET /carritos`). `GET /carritos/activo` lo devuelve y, si no tiene, crea uno vacio (cumple lo que pidio la docente: un GET sobre el carrito del token que devuelve o crea el unico carrito activo). La unicidad la garantiza el bloqueo de la fila del usuario al crear (probado con 12 pedidos simultaneos del mismo usuario: un solo carrito). `POST /carritos` sigue haciendo lo mismo y quedo redundante.

Los tests existentes se actualizaron a los cambios previos (registro devuelve `201`, `POST /carritos` sin body, imagenes paginadas, nombre de locacion unico, `GET /carritos/activo` crea el carrito). Pendientes: ver [[contexto]].

Ver [[arquitectura]].

## 2026-09-08 - Endurecimiento de auditoria (endpoints y reglas de negocio)

`AuthorizationService` pasa a fallar cerrado: si falta el id o la autenticacion,
o si el recurso (usuario, carrito, compra, ticket) no existe, no autoriza. Antes
devolvia `true` por defecto (`orElse(true)`), lo que autorizaba ante recursos
inexistentes o ids nulos.

Toda compra nace del carrito activo del usuario autenticado: `POST /compras` no
recibe body, el usuario sale del token y `crearCompra` rechaza con
`CarritoActivoInexistenteException` o `CarritoVacioException` si no hay un carrito
activo o esta vacio. Se elimina la compra directa sin carrito.

Las operaciones sobre el carrito (`/carritos/activo/...`) actuan siempre sobre el
carrito activo del usuario autenticado, por lo que no reciben el id del carrito.
`POST /carritos` obtiene o crea ese carrito y `GET /carritos` lista el historial
propio. Agregar el primer item (`POST /carritos/activo/items`) crea el carrito si
el usuario no tiene uno activo, por lo que el frontend no necesita crearlo antes.

La devolucion (cancelar compra) mantiene la politica actual: solo se reembolsa si
el evento fue cancelado por el organizador. El usuario no cancela su compra por
decision propia.

Otros ajustes de consistencia: el estado de `EventoTipoEntrada` no puede
contradecir el stock (`ACTIVO` con 0 disponible o `AGOTADO` con stock se
rechazan); las fechas de venta nulas se interpretan como "sin restriccion" para
evitar NPE; `utilizar` ticket usa bloqueo pesimista para evitar el doble uso; la
unicidad de titulo de evento se valida con query (`existsByTitulo`) en lugar de
`findAll().stream()`; y los endpoints devuelven `404` (no `400`) cuando la imagen
no existe y `201 Created` al crear un evento.

Ver [[contexto]] y [[arquitectura]].

## 2026-09-08 - Consistencia de compras y datos relacionados

Las operaciones que modifican carrito, compra o stock revierten todos sus cambios ante cualquier excepcion controlada. La compra bloquea el carrito activo del usuario y cada fila de stock mientras los procesa, y compra los items del propio carrito. Obtener o crear el carrito activo bloquea la fila del usuario para que no puedan existir dos carritos activos por pedidos simultaneos. Editar una oferta de entrada (`PATCH /eventosTiposEntrada/{id}`) tambien bloquea su fila para no pisar el stock que descuenta una compra simultanea.
Los borrados de eventos, tipos de entrada y asociaciones evento-tipo se rechazan con `409 Conflict` cuando existen relaciones que deben conservarse. Las locaciones y tipos de entrada rechazan datos incompletos y nombres duplicados.

Ver [[contexto]] y [[arquitectura]].

## 2026-09-05 - Autenticacion sin estado mediante JWT

Se adopta Spring Security con tokens JWT y sesiones `STATELESS`, siguiendo el flujo trabajado en clase. Esto permite que cada integrante agregue reglas por rol a sus endpoints sin volver a implementar el inicio de sesion.

El registro publico crea usuarios con rol `USER`. El rol no se recibe desde el cliente para impedir que un usuario se registre como administrador.

La clave JWT puede definirse con `JWT_SECRET` y su duracion con `JWT_EXPIRATION`. Los valores incluidos por defecto son solamente para desarrollo local.

## 2026-09-05 - Almacenamiento de imagenes de eventos

Las imagenes se guardan en la base como datos binarios mediante `@Lob`. Los endpoints JSON devuelven sus metadatos sin incluir los bytes y un endpoint separado entrega el archivo con su tipo de contenido. Se aceptan solamente archivos de imagen.

## 2026-09-06 - Categorias y eliminacion en cascada

Las categorias dejan de depender de la entidad de ejemplo `Product` y pasan a tener `nombre` y `activo`. Cada evento tiene una categoria mediante `categoria_id`, mientras que una misma categoria puede estar asociada a varios eventos.

Las imagenes dependen de un evento y se eliminan en cascada junto con el. Las categorias no se eliminan en cascada y no pueden borrarse mientras tengan eventos asociados.

## 2026-09-06 - Almacenamiento de imagenes de locaciones

Las imagenes de locaciones siguen el mismo criterio que las imagenes de eventos: el archivo se guarda como datos binarios y las respuestas JSON exponen solamente sus metadatos. Se conservan `textoAlternativo`, `orden` y `fechaCreacion` del modelo relacional.

Las imagenes dependen de su locacion y se eliminan en cascada cuando esa locacion puede ser eliminada. Una locacion con eventos continua protegida por la validacion existente y no se elimina.

## 2026-09-07 - Integracion de tipos de entrada, compras y carrito

Se integra `EventoTipoEntrada` como la configuracion comercial de un tipo de entrada dentro de un evento. Las compras utilizan esa configuracion para validar disponibilidad, calcular descuentos, actualizar stock y generar tickets.

Cada carrito pertenece a un usuario y contiene items asociados a `EventoTipoEntrada`.

## 2026-09-07 - Autorizacion por rol y propietario

Las consultas del catalogo y sus imagenes son publicas. Las operaciones que modifican eventos, categorias, locaciones, imagenes y tipos de entrada requieren rol `ADMIN`. La gestion de carritos y la creacion de compras requieren rol `USER`, mientras que el control mediante codigo QR corresponde a `ADMIN`.

Los recursos particulares se protegen con `@PreAuthorize` y `AuthorizationService`. El email autenticado incluido como sujeto del JWT se compara con el usuario asociado al carrito, compra o ticket antes de ejecutar el controlador.

**Sesion del front (18/10/2026).** El token JWT solo lleva el email, asi que el front no podia saber el rol de quien ingresa. Se agregaron `role`, `email`, `nombre` y `apellido` a la respuesta de registro y login (cambio aditivo: `access_token` no cambia) en vez de crear un `GET /me`. El front guarda la sesion en `localStorage`, que es lo que se vio en clase, y la descarta si el token venció (se lee `exp` del propio token). Queda pendiente reaccionar a un `401` con la sesion abierta (por ejemplo, un token revocado) cuando el resto de la app use el token.

**Estado de los eventos por fecha (18/10/2026).** Un evento ACTIVO podia seguir asi para siempre y vender entradas despues de terminar (nada en la compra miraba la fecha del evento, y ningun proceso lo finalizaba). Se decidio que ACTIVO significa "publicado y a la venta" (lo que todavia no esta listo es BORRADOR). Se eligio un proceso programado, como el de los carritos, en vez de cambiar el estado al consultar: un GET no deberia modificar datos y asi no se paga nada en cada consulta. Como el proceso corre cada tanto, la compra ademas verifica la fecha de fin del evento en el momento (`Evento.haFinalizado`), asi que nunca se vende de mas aunque el proceso tarde. Las ventanas de venta de cada entrada se conservan (permiten preventa y ultima tanda) y tampoco se pueden cargar entradas a un evento cerrado. Las excepciones nuevas heredan de las existentes para no tocar firmas.

**Se elimino la capacidad de la locacion (19/10/2026).** `capacidad_max` se agrego como campo opcional el 02/09 (CRUD de locaciones) y se volvio obligatorio el 08/09 (`nullable = false` y validacion `> 0`). Nunca se leyo en ningun lado: no limita ventas ni se compara con nada, porque el maximo real de cada entrada lo fija el cupo que se carga evento por evento (y la capacidad de un mismo lugar cambia de una fiesta a otra). Un campo obligatorio sin uso solo obligaba a inventar un numero al crear una locacion, asi que se quito de la entidad, del DTO, del servicio, de los tests, del seed y de las bases existentes (ver el script en el README). `ddl-auto=update` no borra columnas: en una base ya creada hay que quitarla a mano, o la columna `NOT NULL` hace fallar el alta de locaciones.

**Tipos de entrada reutilizables y entradas por evento (19/10/2026).** Un tipo de entrada guarda solo nombre, descripcion y si esta activo; el precio, el descuento, el cupo y las fechas de venta se definen en cada evento (`eventos_tipos_entrada`). Desde el front se crean tipos en una pantalla propia (`/admin/tipos-entrada`) o directo desde el panel de entradas del evento, y quedan disponibles para cualquier otro evento. Un tipo ya usado no se elimina (409): se deja inactivo para que no se ofrezca en eventos nuevos. Se mantiene `descripcion_base` (obligatoria en el back) y el detalle del evento la muestra cuando existe. Las tandas (Preventa 1, 2, 3...) se manejan con el estado de cada entrada (activa o pausada), no con fechas: el front ya no pide fechas de venta y manda "desde que se crea hasta el fin del evento" (al editar, realinea el fin con el del evento). El back las sigue exigiendo y las usa como limite. La respuesta de `eventosTiposEntrada` suma `cantidadTotal` y `tipoEntradaDescripcion`, que el front necesita para editar el cupo y mostrar la descripcion.

**Front ajustado a las reglas de `contexto-para-ias.md` (19/10/2026).** Las pantallas de administracion actualizan la lista con la respuesta del back en cada alta, cambio o baja, sin repetir el GET (fotos del evento, fotos de la locacion y entradas del evento). Los efectos que piden datos usan una variable `activo` que se apaga en la limpieza del `useEffect` en lugar de `AbortController`; se dejaron de usar `Promise.all` y `.finally` (los pedidos van encadenados con `.then/.catch`) y `useSearchParams` (los filtros salen de `useLocation` y se cambian con `useNavigate`). No se usa `document` ni `window`: el menu desplegable del header se cierra con un fondo transparente y `onKeyDown`. Se quito el `window.scrollTo(0, 0)` del detalle del evento, asi que al abrirlo desde la mitad del catalogo la pagina conserva su posicion. Excepciones que quedan y hay que poder defender: `useRef` con `scrollIntoView` en la seccion de fechas (llevar la vista a las fechas al volver del detalle), `useParams` para `/eventos/:id` y `/admin/:id`, `FormData` para subir fotos e `Intl.DateTimeFormat` para las fechas en hora de Buenos Aires. Los tests automaticos del front (`npm test`) no se vieron en clase y son del PR #5; no se agregaron nuevos.

**Toda la hora del sistema es la de Buenos Aires (19/10/2026).** Las fechas se guardan en la base sin zona y siempre significan hora de Buenos Aires. Ya no se usa `LocalDateTime.now()` ni `LocalDate.now()` (hora de la maquina) en el back: todo pasa por `FechaCatalogo.ahora()` (carrito, compra, tickets, registro, errores, fotos y el catalogo). Ademas `ZenoirprodApplication` fija la zona por defecto de la JVM en Buenos Aires, asi que cualquier codigo nuevo tambien queda en esa hora aunque la maquina este configurada en otra zona. El front lee las fechas del back sin zona como hora de Buenos Aires. Se verifico corriendo los tests con la maquina simulada en UTC.

**Carrito real en el front (19/10/2026).** El carrito de la pantalla es el que devuelve el back (`GET /carritos/activo`) y cada accion (agregar, cambiar cantidad, quitar, vaciar, iniciar pago) actualiza la pantalla con la respuesta, sin volver a pedirlo. El back agrega de a una entrada por llamada, asi que "Agregar al carrito" las pide en fila y, si una falla, avisa cuantas ya quedaron en el carrito. Al llegar la hora de vencimiento se le pregunta al back: si reemplazo el carrito, se avisa que se libero. Solo el rol USER tiene carrito (el admin recibe 403). "Pagar" queda deshabilitado hasta conectar `POST /compras`: no se simula un cobro. Cambio en el back (aprobado): cada item del carrito suma `eventoId`, `precioOriginal` y `porcentajeDescuento`, para mostrar el flyer, la fecha y el lugar del evento y el precio tachado sin pedidos extra por entrada.

**Compra y entradas reales en el front (19/10/2026).** "Pagar" llama a `POST /compras` (sin body: el back compra el carrito abierto, que tiene que estar EN_PAGO). Del formulario de tarjeta solo se revisa el formato y nunca se envia: el cobro sigue siendo de demostracion, sin pasarela. Con la compra confirmada se pasa a `/compra/:id`: llega con la compra que respondio el back (en el state del router, sin pedirla de nuevo) y, si se recarga la pagina o se entra por un link, se pide por su id. "Mis entradas" muestra los tickets de `GET /compras` (todas las paginas). Cada entrada trae su evento (flyer, fecha y lugar) pedido una vez por evento. Un ticket que no esta EMITIDO se marca como utilizado o cancelado. Se borraron los datos de ejemplo de eventos, ofertas y entradas. Cambio en el back (aprobado): `DetalleCompraResponse` suma `eventoId`, igual que los items del carrito.

**Verificacion de entradas con QR (19/10/2026).** Cada ticket ya tenia un `codigoQr` al azar (UUID que genera el back al comprar), los estados EMITIDO/UTILIZADO/CANCELADO y los endpoints `GET /tickets/qr/{codigo}` y `POST /tickets/qr/{codigo}/utilizar` (solo ADMIN, con bloqueo pesimista contra el doble uso). El front reemplazo el dibujo de relleno por un QR real (`qrcode.react`) que guarda el link `/verificar/<codigo>`: el organizador lo escanea con la camara del celular y esa pantalla consulta la entrada sin gastarla. El ingreso se registra con un boton y no al abrir el link: abrir una pagina no deberia modificar datos (como un GET), una vista previa del link no quema la entrada y React en desarrollo (StrictMode) ejecuta los efectos dos veces, asi que el primer escaneo habria dicho "ya utilizada". La direccion que va dentro del QR sale de `VITE_URL_PUBLICA` (por defecto `http://localhost:5173`; para escanear con el celular, la IP de la PC y `npm run dev -- --host`). Si un visitante abre el link, el aviso lo manda a ingresar y, si entra como ADMIN, el login lo devuelve a la verificacion (`state` del link). Cambio en el back: los dos endpoints de QR devuelven `TicketVerificacionResponse`, que suma a los campos del ticket el nombre del comprador, el evento (id, titulo, inicio y fin), la locacion y el tipo de entrada (cambio aditivo: los campos anteriores no cambian). Los datos salen de `CompraRepository.findByCodigoQrDeTicket` (la compra que contiene ese ticket); `TicketService.getPorCodigoQr` se reemplazo por `getCompraPorCodigoQr`, porque su unico uso era ese endpoint. Pruebas: `TicketVerificacionIntegrationTests` (H2) en el back y `tests/verificacion.test.mjs`, que se suma al `npm test` existente.

**Lugar y categoria desde el formulario del evento (19/10/2026).** Crear un evento obligaba a dar de alta antes la locacion en otra pantalla, y no habia ninguna pantalla para crear categorias. Ahora "Lugar" y "Categoria" son campos de texto con sugerencias (`<datalist>`, HTML nativo): si el nombre coincide con uno existente (sin importar mayusculas ni espacios) se usa ese; si es nuevo, se crea en el back al guardar el evento y despues se edita en su pantalla. Una locacion nueva necesita direccion (el back la exige), asi que ese campo aparece solo cuando el lugar escrito es nuevo. Las categorias inactivas no se sugieren y, si se escriben igual, el formulario avisa en lugar de crear un duplicado. Si al crear el back responde 409 (por ejemplo, porque se creo en un intento anterior que fallo despues), se busca el existente y se usa ese. Se agrego `/admin/categorias` (crear, renombrar, activar o desactivar y eliminar; con eventos el back responde 409 y no se borra), con el mismo patron que tipos de entrada. No hubo cambios en el back: ya tenia `POST/PATCH/DELETE /categories` y `POST /locaciones`. Pruebas: `tests/guardarEvento.test.mjs`.

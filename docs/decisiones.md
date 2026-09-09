# Decisiones

## 2026-09-08 - Rama de exposicion con SQL Server y datos precargados

La exposicion se ejecuta desde `codex/oral-demo-sqlserver`, cuyo perfil por
defecto es `demo-sqlsrv`. La precarga se mantiene aislada mediante
`@Profile("demo-sqlsrv")`, usa los repositorios JPA y conserva las imagenes de
demostracion como recursos del classpath para poder guardarlas en SQL Server.

Se usan emails con dominio `.demo` como marcador idempotente y para evitar
colisiones con usuarios reales. El escenario incluye un usuario con historial,
otro usuario limpio para ejecutar operaciones en vivo y una entrada agotada
para demostrar estados distintos sin multiplicar registros equivalentes.

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

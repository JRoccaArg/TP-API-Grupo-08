# Arquitectura

## Autenticacion

1. `AuthenticationController` recibe el registro o el inicio de sesion.
2. `AuthenticationService` crea el usuario o valida sus credenciales.
3. `JwtService` genera y valida el token.
4. `JwtAuthenticationFilter` lee el encabezado `Authorization` en cada solicitud.
5. `SecurityConfig` permite autenticacion y consultas publicas del catalogo, y exige autenticacion en los demas.
6. `ApplicationConfig` conecta Spring Security con `UserRepository` y BCrypt.
7. `@PreAuthorize` controla los roles antes de ejecutar los metodos de los controladores.
8. `AuthorizationService` compara el usuario autenticado con el propietario de carritos, compras y tickets.

Las operaciones administrativas usan `hasRole('ADMIN')`. Los recursos propios combinan `hasRole('USER')` con la comprobacion de propiedad.

Ver [[contexto]] y [[decisiones]].

## Reserva de entradas

1. Estados del carrito: `ACTIVO` (armando) → `EN_PAGO` (en la pantalla de pago) → `CONVERTIDO` (pagado) o `ABANDONADO` (abandonado o vencido, con los items vaciados). En `ACTIVO` y `EN_PAGO` las entradas ya estan apartadas hasta `fechaVencimiento`.
2. Agregar o subir la cantidad descuenta de `cantidadDisponible` en el acto. La primera entrada fija el reloj de armado (15 minutos, sin renovarse); si el carrito se vacia, el reloj se borra.
3. `POST /carritos/activo/iniciar-pago` pasa el carrito a `EN_PAGO` y arranca un reloj de pago nuevo (15 minutos desde ese momento). No toca el stock; volver a llamarlo no reinicia el reloj. `POST /compras` es el boton de pagar (simulado).
4. Quitar, bajar la cantidad, vaciar o abandonar devuelven las entradas. `CarritoVencimientoScheduler` devuelve las de los carritos abiertos vencidos y los deja `ABANDONADO`.
5. Orden de bloqueos en toda operacion: usuario, carrito y ofertas ordenadas por id.
6. La oferta se bloquea y se refresca (`bloquearOferta`) para leer el stock ya confirmado por otra operacion.

## Consistencia de compra

1. Se bloquea el carrito del usuario y se valida que este vigente, con items y `EN_PAGO` (el usuario entro a la pantalla de pago).
2. Los tipos de entrada se ordenan por id para adquirir sus bloqueos siempre en el mismo orden.
3. Cada oferta se vuelve a leer bloqueada y se valida (evento activo, oferta activa o agotada, periodo de venta). El stock no se toca: ya estaba reservado.
4. Si cualquier paso falla, `@Transactional(rollbackFor = Exception.class)` revierte la operacion completa.
5. Al confirmar, la compra queda vinculada y el carrito pasa a `CONVERTIDO`.

Los servicios consultan las relaciones antes de borrar entidades referenciadas y devuelven un conflicto controlado en lugar de delegar el error a la base de datos.

## Imagenes de eventos

Los datos binarios se guardan como `byte[]` mediante `@Lob`. Las respuestas JSON muestran los metadatos y omiten los bytes. El contenido se descarga desde el endpoint terminado en `/archivo`, que conserva el tipo de contenido original.

## Imagenes de locaciones

`ImagenLocacion` pertenece a una sola `Locacion`. El archivo se recibe como multipart y se guarda como `byte[]` mediante `@Lob`. Los endpoints de metadatos omiten esos bytes y el endpoint terminado en `/archivo` entrega el contenido.

## Categorias

`Category` representa el nombre y el estado de una categoria. `Evento` tiene una relacion `ManyToOne` con `Category`: cada evento pertenece a una sola categoria y una categoria puede contener varios eventos.

## Venta de entradas

`EventoTipoEntrada` relaciona un evento con un tipo de entrada y mantiene su precio, descuento, periodo de venta y stock. `Carrito` pertenece a un usuario y contiene sus `ItemCarrito`. Las entradas se descuentan del stock cuando entran al carrito (ver Reserva de entradas); al pagar se crean los detalles y tickets correspondientes.

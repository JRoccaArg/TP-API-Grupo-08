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

## Imagenes de eventos

Los datos binarios se guardan como `byte[]` mediante `@Lob`. Las respuestas JSON muestran los metadatos y omiten los bytes. El contenido se descarga desde el endpoint terminado en `/archivo`, que conserva el tipo de contenido original.

## Imagenes de locaciones

`ImagenLocacion` pertenece a una sola `Locacion`. El archivo se recibe como multipart y se guarda como `byte[]` mediante `@Lob`. Los endpoints de metadatos omiten esos bytes y el endpoint terminado en `/archivo` entrega el contenido.

## Categorias

`Category` representa el nombre y el estado de una categoria. `Evento` tiene una relacion `ManyToOne` con `Category`: cada evento pertenece a una sola categoria y una categoria puede contener varios eventos.

## Venta de entradas

`EventoTipoEntrada` relaciona un evento con un tipo de entrada y mantiene su precio, descuento, periodo de venta y stock. `Carrito` pertenece a un usuario y contiene sus `ItemCarrito`. Al confirmar una compra se crean los detalles y tickets correspondientes y se descuenta el stock.

# Contexto

Zenoir es una API para publicar eventos, administrar locaciones, tipos de entrada, compras, tickets e imagenes asociadas a los eventos.

## Estado actual

- El proyecto levanta con el perfil `dev` y una base H2 en memoria.
- Existe registro e inicio de sesion mediante JWT.
- Los usuarios nuevos se registran con el rol `USER`.
- Los endpoints de autenticacion y las consultas del catalogo son publicos.
- La administracion de eventos, categorias, locaciones, imagenes y tipos de entrada requiere rol `ADMIN`.
- Los carritos requieren rol `USER` y solamente pueden ser utilizados por su propietario.
- Las compras y tickets propios pueden ser consultados por el usuario; los QR se consultan y utilizan con rol `ADMIN`.
- Las imagenes de eventos se reciben como archivos multipart y se guardan en la base.
- Los archivos admitidos deben ser imagenes.
- La subida de una imagen devuelve `201 Created` y los listados se ordenan por el campo `orden` de forma ascendente.
- Las imagenes de locaciones tambien se reciben como archivos multipart, se guardan en la base y se ordenan de forma ascendente.
- El registro y el inicio de sesion validan los datos recibidos y devuelven errores controlados.
- Los usuarios guardan nombre, apellido, DNI, fecha de nacimiento, email, password, rol, fecha de registro y estado activo.
- Cada evento pertenece a una categoria y una categoria puede contener varios eventos.
- Al eliminar un evento tambien se eliminan sus imagenes, pero se conserva su categoria.
- Al eliminar una locacion sin eventos tambien se eliminan sus imagenes.
- Una categoria que tiene eventos asociados no puede eliminarse.
- Cada evento puede ofrecer distintos tipos de entrada con precio, descuento, stock y periodo de venta.
- Las compras validan disponibilidad, descuentan stock y generan tickets; al cancelarse reponen el stock correspondiente.
- Cada usuario puede tener un carrito activo con sus propios items de entrada.

## Decisiones clave

Ver [[decisiones]] y [[arquitectura]].

## Cosas a evitar

- No aceptar el rol enviado por un registro publico.
- No guardar contraseñas sin codificar.
- No incluir claves reales o archivos locales con credenciales en Git.

## Pendiente

- Agregar filtros opcionales al listado de eventos.

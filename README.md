# Zenoir Prod

Venta de entradas para fiestas y eventos. Trabajo práctico de Aplicaciones Interactivas (UADE, 2026).

Un visitante mira el catálogo y el detalle de cada evento. Con su cuenta arma un carrito (las entradas quedan reservadas 15 minutos), paga y recibe sus entradas con un QR, también por mail. El administrador carga eventos, locaciones, categorías y tipos de entrada, y escanea los QR en la puerta.

## Qué hay en el repo

- `zenoirprod/`: el back (Java 17, Spring Boot, JWT, SQL Server).
- `frontend/`: el front (React, Vite, JavaScript).
- `docs/arquitectura.md`: cómo funcionan la autenticación y la reserva de entradas.
- `ENTIDAD - RELACION.txt`: el modelo de datos.

## Cómo levantarlo

Necesitás Java 17 o más, Node 20.19 o más y un SQL Server local con una base vacía llamada `Zenoir_Prod`. Las tablas las crea el back solo.

**Config de tu máquina.** Creá el archivo `zenoirprod/config/application.properties` (git lo ignora) con la clave de SQL Server y, si querés, el mail:

```properties
spring.datasource.password=la_clave_de_sa
zenoir.mail.activo=false
```

Por defecto se conecta a `localhost:1433`, base `Zenoir_Prod`, usuario `sa`. Para otros valores se agregan `spring.datasource.url` y `spring.datasource.username`, o las variables `DB_HOST`, `DB_PORT`, `DB_NAME` y `DB_USER`. Para una instancia con nombre (por ejemplo `SQLEXPRESS`) se pasa la URL completa en `spring.datasource.url`. Sin ese archivo (y sin `DB_PASSWORD`) el back arranca con una base en memoria, vacía de datos propios.

**Back.** Desde VS Code: abrí la carpeta `zenoirprod` y ejecutá `ZenoirprodApplication` (o "Zenoir back" en Run and Debug). Desde la terminal, en `zenoirprod`: `./mvnw spring-boot:run` (en Windows `.\mvnw.cmd spring-boot:run`). Queda en `http://localhost:8080`.

**Front** (desde `frontend`):

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173` y le habla al back por el proxy `/api`.

## Datos de ejemplo

Hay un catálogo listo para cargar (eventos, locaciones, entradas y fotos). Se carga una sola vez en una base vacía: ver [zenoirprod/database/seed](zenoirprod/database/seed/README.md).

## Usuarios

Cualquiera se registra desde el front y queda como comprador. Para tener un administrador, se registra la cuenta y en la base se corre:

```sql
UPDATE usuarios SET rol = 'ADMIN' WHERE email = 'tu_email';
```

## Mail con las entradas

Al confirmar una compra el back manda un mail con las entradas y sus QR. Viene apagado. Para activarlo se necesita una cuenta de Gmail con verificación en dos pasos y una [contraseña de aplicación](https://myaccount.google.com/apppasswords). Se cargan en el archivo `zenoirprod/config/application.properties` (git lo ignora):

```properties
zenoir.mail.activo=true
zenoir.mail.remitente=cuenta@gmail.com
spring.mail.username=cuenta@gmail.com
spring.mail.password=contraseña-de-aplicación
```

También se puede con las variables de entorno `ZENOIR_MAIL_ACTIVO`, `ZENOIR_MAIL_USUARIO` y `ZENOIR_MAIL_CLAVE`.

## Endpoints principales

| Módulo | Rutas |
| --- | --- |
| Cuenta | `POST /api/v1/auth/register`, `POST /api/v1/auth/authenticate` |
| Eventos | `/eventos` (listado paginado, detalle, alta, cambio y baja) y sus fotos en `/eventos/{id}/imagenes` |
| Locaciones | `/locaciones` y sus fotos en `/locaciones/{id}/imagenes` |
| Categorías y tipos de entrada | `/categories`, `/tiposEntrada` |
| Entradas de un evento | `/eventosTiposEntrada` (precio, cupo y estado de cada tipo) |
| Carrito | `/carritos/activo` y sus items; `iniciar-pago`, `vaciar` y `abandonar` |
| Compras | `POST /compras` (pago simulado), `GET /compras`, `POST /compras/{id}/eventos/{eventoId}/reembolsar` |
| Tickets | `GET /tickets/qr/{codigo}` y `POST /tickets/qr/{codigo}/utilizar` |

Los de lectura del catálogo son públicos; el resto pide el token y, según el caso, rol `ADMIN`.

## Tests

```bash
cd zenoirprod && ./mvnw test      # back (usa una base en memoria)
cd frontend && npm test           # front
```

## Si algo falla

- `Login failed for user 'sa'`: la clave está mal o el usuario `sa` está deshabilitado en SQL Server.
- No conecta (timeout): activar el protocolo TCP/IP en el Administrador de configuración de SQL Server y reiniciar el servicio.
- Si la base ya existía de antes, correr una vez en SQL Server:

```sql
-- permite el estado EN_PAGO del carrito
DECLARE @c sysname = (SELECT name FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('Carritos') AND definition LIKE '%CONVERTIDO%');
IF @c IS NOT NULL EXEC('ALTER TABLE Carritos DROP CONSTRAINT ' + QUOTENAME(@c));
ALTER TABLE Carritos ADD CONSTRAINT CK_Carritos_estado CHECK (estado IN ('ACTIVO', 'EN_PAGO', 'CONVERTIDO', 'ABANDONADO'));

-- la capacidad de las locaciones ya no existe
IF COL_LENGTH('Locaciones', 'capacidad_max') IS NOT NULL ALTER TABLE Locaciones DROP COLUMN capacidad_max;
```

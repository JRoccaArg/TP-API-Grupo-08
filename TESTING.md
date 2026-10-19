# Pruebas de catálogo y detalle

## Backend sin base de datos

Requiere Java 17 o superior. Desde `zenoirprod/`:

```bash
./mvnw test
```

En PowerShell: `.\mvnw.cmd test`.
JUnit 5, Mockito, AssertJ y MockMvc vienen de `spring-boot-starter-test`.
Las pruebas cubren el contrato HTTP, parámetros y errores, validaciones y filtros del servicio,
precios con descuento y paginación. MockMvc usa el controller sin filtros de seguridad;
no es una prueba de autenticación ni una verificación integral de la aplicación.
Los reportes Maven se generan en `zenoirprod/target/surefire-reports/` y no se suben.

## Integración del repositorio con SQL Server

`CatalogoRepositoryTest` requiere una base **vacía y exclusiva para pruebas**, por ejemplo
`Zenoir_Prod_Test`, creada previamente. Hibernate crea y borra las tablas de esa base
(`create-drop`). Nunca uses la URL de tu base habitual, del seed ni de producción.
Las transacciones de cada prueba se revierten. Las credenciales van por variables de entorno:

```powershell
$env:TEST_DB_URL="jdbc:sqlserver://localhost:1433;databaseName=Zenoir_Prod_Test;encrypt=true;trustServerCertificate=true;"
$env:TEST_DB_USER="usuario_de_pruebas"
$env:TEST_DB_PASSWORD="tu_password"
cd zenoirprod
.\mvnw.cmd test
```

En Bash/WSL, usá `export TEST_DB_URL=...`, `export TEST_DB_USER=...` y
`export TEST_DB_PASSWORD=...`, luego `./mvnw test`.
Si `TEST_DB_URL` no está definida, las ocho pruebas de repositorio se omiten explícitamente;
las unitarias se ejecutan igual. Estas pruebas usan SQL Server, no H2.
Incluyen filtros antes de paginar (7 resultados en páginas de 6 y 1), totales sin duplicados,
rangos sobre una misma oferta, descuentos, stock y ventanas de venta.

## Frontend

Con Node compatible con Vite 8 (por ejemplo Node 24), desde `frontend/`:

```bash
npm ci
npm test
npm run lint
npm run build
```

Las pruebas usan el runner de Node, Fetch simulado y renderizado de componentes React.
No requieren un backend activo. No sustituyen la revisión visual responsive ni la navegación
integral contra la API.

## Verificación de entradas (QR)

- Back: `TicketVerificacionIntegrationTests` (H2 en memoria, no toca la base real). Cubre consultar un ticket
  válido con su comprador y evento, que consultar no lo gasta, que se usa una sola vez (409 la segunda),
  el 404 de un código inexistente y que solo el ADMIN puede verificar. Solo esa clase:
  `./mvnw test -Dtest=TicketVerificacionIntegrationTests`.
- Front: `tests/verificacion.test.mjs` (dentro de `npm test`). Cubre el link que guarda el QR, el mensaje para
  cada estado, los pedidos al back y que las tarjetas muestran el QR real.
- Manual: comprar una entrada, abrir su QR (o el link `/verificar/<código>`) con una cuenta ADMIN, registrar el
  ingreso y volver a abrirlo para ver "Entrada ya utilizada".

## Qué se sube

Se versionan fuentes de tests, configuración necesaria y esta guía. No se versionan credenciales,
archivos `.env`, bases de datos, `node_modules`, `target`, `dist` ni reportes generados.

# TP-API-Grupo-08 — Zenoir Prod

API REST de venta de entradas para eventos. TPO de Aplicaciones Interactivas (UADE, 2º cuatrimestre 2026).

## Cómo levantarlo

```bash
cd zenoirprod
./mvnw spring-boot:run
```

En Windows con CMD o PowerShell, usar `mvnw.cmd spring-boot:run`.

La API queda en `http://localhost:8080`.

Por defecto arranca con el perfil **`sqlsrv`**, que se conecta al **SQL Server local**
(`localhost:1433`, base `Zenoir_Prod`, usuario `sa`). Requiere tener SQL Server corriendo y la
base `Zenoir_Prod` creada (ver más abajo). Cada valor se puede pisar con variables de entorno
(`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).

### Alternativa opcional: H2 en memoria

Si querés levantarlo en una máquina sin SQL Server, está el perfil **`dev`** (base H2 en
memoria). Los datos se pierden al apagar la aplicación. Este perfil no usa la base ni
el seed de SQL Server: para verificar el catálogo compartido y sus imágenes, usá `sqlsrv`.

```bash
cd zenoirprod
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Para inspeccionar la base: `http://localhost:8080/h2-console`
(JDBC URL `jdbc:h2:mem:zenoir`, usuario `sa`, contraseña vacía).

## Usar SQL Server en vez de H2

Para replicar el catálogo completo con ofertas e imágenes, seguí la
[guía del seed de SQL Server](zenoirprod/database/seed/README.md). La carga es manual
y requiere una base vacía con las tablas generadas por el backend.


El equipo usa esto para tener persistencia real (los datos no se borran al apagar la
app). Cada integrante usa **su propio SQL Server local**, no uno compartido. Estos pasos
se hacen **una sola vez** por máquina.

### 1. Habilitar el usuario `sa` (si todavía no está)

Con SQL Server instalado (por ejemplo, SQL Server Express de la cursada), abrir
**SQL Server Management Studio (SSMS)**, conectarse a tu instancia y:

1. Click derecho sobre el nombre del servidor (la raíz del árbol) → **Propiedades** →
   sección **Seguridad** → marcar **"SQL Server and Windows Authentication mode"** → OK.
2. En el árbol: **Seguridad → Inicios de sesión → sa** → click derecho → **Propiedades**.
   Tildar **"Habilitar"**, y en la pestaña General ponerle una contraseña (anotala, la
   vas a necesitar abajo).
3. Reiniciar el servicio de SQL Server para que tome el cambio de modo de autenticación:
   buscar "Servicios" en Windows → **SQL Server (nombre_de_tu_instancia)** → click derecho
   → **Reiniciar**.

### 2. Crear la base de datos

En SSMS, click derecho sobre **Bases de datos** → **Nueva base de datos** → nombre
`Zenoir_Prod` → Aceptar. (No hace falta crear tablas: Hibernate las genera solo al
levantar la app.)

### 3. Anotar cómo se llama tu instancia

Mirá el nombre del servidor con el que te conectaste en SSMS (arriba a la izquierda del
árbol, o en el diálogo de conexión). Hay dos casos:

- **Instancia por defecto** — el nombre es solo la PC, ej. `DESKTOP-ABC123`. Escucha en
  el puerto `1433` de siempre: usá las variables simples del punto 4a.
- **Instancia con nombre** — el nombre tiene una barra, ej. `DESKTOP-ABC123\SQLEXPRESS01`
  Puede usar un puerto distinto de 1433: usá la variante del punto 4b.

### 4a. Levantar la app — instancia por defecto

```bash
cd zenoirprod
DB_PASSWORD=tu_password ./mvnw spring-boot:run -Dspring-boot.run.profiles=sqlsrv
```

Variables disponibles (todas opcionales salvo `DB_PASSWORD`):

| Variable | Default |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `1433` |
| `DB_NAME` | `Zenoir_Prod` |
| `DB_USER` | `sa` |
| `DB_PASSWORD` | *(vacía — hay que pasarla)* |

### 4b. Levantar la app — instancia con nombre (ej. `SQLEXPRESS01`)

Se pasa la URL de conexión completa, que pisa la configuración por defecto sin tocar
ningún archivo:

```bash
cd zenoirprod
SPRING_DATASOURCE_URL="jdbc:sqlserver://localhost\SQLEXPRESS01;databaseName=Zenoir_Prod;encrypt=true;trustServerCertificate=true;" \
SPRING_DATASOURCE_USERNAME=sa \
SPRING_DATASOURCE_PASSWORD=tu_password \
./mvnw spring-boot:run -Dspring-boot.run.profiles=sqlsrv
```

Cambiar `SQLEXPRESS01` por el nombre real de tu instancia. En PowerShell, las variables
se setean así en vez de con `VAR=valor`:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:sqlserver://localhost\SQLEXPRESS01;databaseName=Zenoir_Prod;encrypt=true;trustServerCertificate=true;"
$env:SPRING_DATASOURCE_USERNAME="sa"
$env:SPRING_DATASOURCE_PASSWORD="tu_password"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=sqlsrv"
```

La contraseña no está en el repo: cada uno la define en su propia máquina.

### Si la conexión falla

- **`Login failed for user 'sa'`** → contraseña mal o el usuario `sa` sigue deshabilitado
  (repetir el paso 1).
- **`The TCP/IP connection to the host ... has failed` / timeout** → el protocolo TCP/IP
  de SQL Server suele venir apagado. Abrir **SQL Server Configuration Manager** → 
  **Configuración de redes de SQL Server** → **Protocolos de \[tu instancia\]** →
  click derecho en **TCP/IP** → **Habilitar** → reiniciar el servicio de SQL Server.
- **Con instancia con nombre, sigue sin conectar** → verificar que el servicio
  **SQL Server Browser** esté iniciado (Servicios de Windows), es el que resuelve el
  nombre de instancia al puerto real.

### Si tu base de SQL Server ya estaba creada (estado `EN_PAGO` del carrito)

Hibernate creó en su momento una restricción `CHECK` en la tabla `Carritos` con los estados
de entonces (`ACTIVO`, `CONVERTIDO`, `ABANDONADO`) y `ddl-auto=update` no la actualiza: sin este
paso, iniciar el pago de un carrito falla. Se corre **una sola vez** por base (en una base nueva, o con el
perfil `dev`, no hace falta). Reemplazá `Zenoir_Prod` por el nombre de tu base:

```sql
USE Zenoir_Prod;
DECLARE @nombre sysname = (SELECT name FROM sys.check_constraints
                           WHERE parent_object_id = OBJECT_ID('Carritos') AND definition LIKE '%CONVERTIDO%');
IF @nombre IS NOT NULL EXEC('ALTER TABLE Carritos DROP CONSTRAINT ' + QUOTENAME(@nombre));
ALTER TABLE Carritos ADD CONSTRAINT CK_Carritos_estado
    CHECK (estado IN ('ACTIVO', 'EN_PAGO', 'CONVERTIDO', 'ABANDONADO'));
```

### Si tu base de SQL Server ya estaba creada (columna `capacidad_max` de las locaciones)

La capacidad de la locación se eliminó (no se usaba para nada). `ddl-auto=update` no borra columnas: en una base ya creada
la columna `capacidad_max` sigue siendo `NOT NULL` y, sin este paso, crear una locación falla. Se corre **una sola vez** por base
(en una base nueva, o con el perfil `dev`, no hace falta) y se puede repetir sin problema. Reemplazá `Zenoir_Prod` por el nombre de tu base:

```sql
USE Zenoir_Prod;
IF COL_LENGTH('Locaciones', 'capacidad_max') IS NOT NULL ALTER TABLE Locaciones DROP COLUMN capacidad_max;
```

## Mail con las entradas (JavaMail)

Al confirmar una compra, el back le manda al comprador un mail con sus entradas: una tarjeta por entrada con el evento, la fecha, el lugar y el QR como imagen (el mismo link `/verificar/<código>` que el QR de la página). Se manda en segundo plano: si el mail falla, la compra queda hecha igual y el error queda en el log.

**Por defecto está apagado**: no se manda nada y en el log aparece `Mail desactivado`. Así el proyecto y los tests corren sin credenciales. Para mandar de verdad hace falta una cuenta de correo desde la que salen los mails (JavaMail es la librería que los manda; la cuenta es el servidor SMTP). Con Gmail:

1. En la cuenta de Google del grupo, activá la **verificación en 2 pasos**.
2. Entrá a <https://myaccount.google.com/apppasswords> y creá una **contraseña de aplicación** (16 letras). No es la contraseña normal de la cuenta.
3. Antes de levantar el back, definí estas variables (en la misma terminal):

   PowerShell:
   ```powershell
   $env:ZENOIR_MAIL_ACTIVO="true"
   $env:ZENOIR_MAIL_USUARIO="la-cuenta@gmail.com"
   $env:ZENOIR_MAIL_CLAVE="la contraseña de aplicación"
   ```
   Git Bash:
   ```bash
   export ZENOIR_MAIL_ACTIVO=true ZENOIR_MAIL_USUARIO=la-cuenta@gmail.com ZENOIR_MAIL_CLAVE="la contraseña de aplicación"
   ```
4. Comprá una entrada con un usuario registrado con un **mail real**: las entradas llegan a esa casilla (la primera vez, revisá Spam).

Las credenciales van por variables de entorno y nunca se suben a git. Con otro proveedor se cambian también `ZENOIR_MAIL_HOST` y `ZENOIR_MAIL_PUERTO`. `ZENOIR_FRONT_URL` (por defecto `http://localhost:5173`) es la dirección que va en el QR y en el botón "Ver mis entradas". Todo esto está en `application.properties`.

## Endpoints actuales

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/eventos?page=&size=` | Lista de eventos, paginada |
| `GET` | `/eventos/{id}` | Detalle de un evento |
| `POST` | `/eventos` | Crear evento |
| `PATCH` | `/eventos/{id}` | Modificar evento |
| `DELETE` | `/eventos/{id}` | Eliminar evento |
| `GET` | `/eventos/{eventoId}/imagenes` | Lista de imagenes del evento |
| `GET` | `/eventos/{eventoId}/imagenes/{imagenId}` | Metadatos de una imagen |
| `GET` | `/eventos/{eventoId}/imagenes/{imagenId}/archivo` | Archivo de una imagen |
| `POST` | `/eventos/{eventoId}/imagenes` | Subir una imagen |
| `PATCH` | `/eventos/{eventoId}/imagenes/{imagenId}` | Modificar una imagen |
| `DELETE` | `/eventos/{eventoId}/imagenes/{imagenId}` | Eliminar una imagen |
| `GET` | `/locaciones/{locacionId}/imagenes` | Lista de imágenes de la locación |
| `GET` | `/locaciones/{locacionId}/imagenes/{imagenId}` | Metadatos de una imagen de locación |
| `GET` | `/locaciones/{locacionId}/imagenes/{imagenId}/archivo` | Archivo de una imagen de locación |
| `POST` | `/locaciones/{locacionId}/imagenes` | Subir una imagen de locación |
| `PATCH` | `/locaciones/{locacionId}/imagenes/{imagenId}` | Modificar una imagen de locación |
| `DELETE` | `/locaciones/{locacionId}/imagenes/{imagenId}` | Eliminar una imagen de locación |
| `GET` | `/categories?page=&size=` | Lista de categorías, paginada |
| `GET` | `/categories/{id}` | Detalle de categoría |
| `POST` | `/categories` | Crear categoría |
| `PATCH` | `/categories/{id}` | Modificar categoría |
| `DELETE` | `/categories/{id}` | Eliminar categoría |
| `GET` | `/carritos/activo` | Carrito abierto del usuario (si no tiene, lo crea vacío; máximo uno abierto por usuario), con precios y total |
| `POST` | `/carritos/activo/items` | Agregar una entrada al carrito: la aparta en el acto y asegura 15 min desde la primera |
| `PATCH` | `/carritos/activo/items/{itemId}` | Cambiar la cantidad de un item (aparta o devuelve la diferencia) |
| `DELETE` | `/carritos/activo/items/{itemId}` | Quitar un item (devuelve la entrada) |
| `POST` | `/carritos/activo/iniciar-pago` | Al abrir la pantalla de pago: el carrito pasa a `EN_PAGO` y arranca un reloj de pago de 15 min |
| `POST` | `/carritos/activo/vaciar` | Vaciar el carrito (devuelve las entradas) |
| `POST` | `/carritos/activo/abandonar` | Abandonar el carrito (devuelve las entradas y lo vacía) |
| `POST` | `/compras` | Botón de pagar (simulado, sin pasarela): exige haber iniciado el pago |
| `POST` | `/api/v1/auth/register` | Registrar usuario. Responde `201` con `access_token`, `role`, `email`, `nombre` y `apellido` |
| `POST` | `/api/v1/auth/authenticate` | Iniciar sesión. Responde con los mismos campos que el registro |

## Estructura

```
zenoirprod/src/main/java/com/uade/tpo/Zenoirprod/
├── controllers/   endpoints REST
├── service/       lógica de negocio (interfaz + Impl)
├── repository/    acceso a datos (Spring Data JPA)
├── entity/        entidades JPA
│   └── dto/       objetos de request
└── exceptions/    excepciones mapeadas a códigos HTTP
```

El modelo de datos acordado está en `ENTIDAD - RELACION.txt`.

## Si el build falla

**`cannot find symbol: method getX()` o `TypeTag :: UNKNOWN`** — Lombok no corrió.
Ya está resuelto en el `pom.xml` (Lombok fijado en 1.18.46 y declarado como
`annotationProcessorPath`, necesario desde JDK 23). Si pasa igual en IntelliJ:
`File > Invalidate Caches`, y verificar que el Project SDK sea 17 o superior.

**IntelliJ no reconoce los getters pero Maven compila** — habilitar
`Settings > Build > Compiler > Annotation Processors > Enable annotation processing`.
# Ejecutar con SQL Server

El perfil por defecto es `sqlsrv` y conecta con SQL Server. La base indicada por
`DB_NAME` debe existir antes de iniciar. Los valores por defecto apuntan a
`localhost:1433`, base `Zenoir_Prod`, usuario `sa` y password vacia. Se pueden
reemplazar sin editar archivos:

```powershell
$env:DB_NAME="Zenoir_Prod"
$env:DB_USER="sa"
$env:DB_PASSWORD="tu_password"
cd zenoirprod
.\mvnw.cmd spring-boot:run
```

Tambien esta disponible el perfil `dev` (base H2 en memoria) para levantar sin
instalar SQL Server: `-Dspring-boot.run.profiles=dev`.

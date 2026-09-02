# TP-API-Grupo-08 — Zenoir Prod

API REST de venta de entradas para eventos. TPO de Aplicaciones Interactivas (UADE, 2º cuatrimestre 2026).

## Cómo levantarlo

Único requisito: **JDK 17 o superior**. No hace falta instalar Maven (viene el wrapper) ni SQL Server.

```bash
cd zenoirprod
./mvnw spring-boot:run
```

En Windows con CMD o PowerShell, usar `mvnw.cmd spring-boot:run`.

La API queda en `http://localhost:8080`.

Por defecto arranca con el perfil **`dev`**, que usa una base **H2 en memoria**: no hay que
configurar nada y funciona en cualquier máquina. Los datos se pierden al apagar la aplicación.

Para inspeccionar la base: `http://localhost:8080/h2-console`
(JDBC URL `jdbc:h2:mem:zenoir`, usuario `sa`, contraseña vacía).

## Usar SQL Server en vez de H2

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
  (así es la tuya). No usa el puerto 1433 fijo: usá la variante del punto 4b.

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

## Endpoints actuales

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/eventos?page=&size=` | Lista de eventos, paginada |
| `GET` | `/eventos/{id}` | Detalle de un evento |
| `POST` | `/eventos` | Crear evento |
| `DELETE` | `/eventos/{id}` | Eliminar evento |
| `GET` | `/categories?page=&size=` | Lista de categorías, paginada |
| `GET` | `/categories/{id}` | Detalle de categoría |
| `POST` | `/categories` | Crear categoría |

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

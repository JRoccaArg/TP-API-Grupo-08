# Replicar el catálogo en SQL Server

Esta instantánea del 20/10/2026 reproduce los datos del catálogo tal como están en la base
de desarrollo: IDs, relaciones, fechas, textos, estados, precios, descuentos, stock y
archivos de imagen originales (flyer y dos fotos de galería por evento, y fotos de las locaciones).
No requiere dependencias nuevas ni archivos externos al repositorio.

| Tabla | Filas |
| --- | ---: |
| categorias | 7 |
| locaciones | 2 |
| tipos_entrada | 5 |
| eventos | 8 |
| eventos_tipos_entrada | 13 |
| imagenes_eventos | 24 |
| imagenes_locacion | 2 |

Las tablas de usuarios, carritos, compras y tickets quedan vacías: no se copian cuentas,
contraseñas ni compras. Como las compras no se copian, el stock de cada entrada es el que
tenía antes de comprar: Preventa 1 de After Palace, que en la base de desarrollo está agotada por una compra
de sus 2 entradas, queda activa con 2 disponibles.
Para tener un administrador: registrá una cuenta desde el front y, en la base, ejecutá
`UPDATE usuarios SET rol = 'ADMIN' WHERE email = 'tu_email';`.

## 1. Preparar una base vacía

Seguí la configuración de SQL Server del [README general](../../../README.md#usar-sql-server-en-vez-de-h2).
Usá una base nueva si ya tenés datos que querés conservar. No borres tu base existente.
La base debe existir antes de iniciar Spring Boot; por ejemplo, desde SSMS:

```sql
CREATE DATABASE Zenoir_Replica;
```

En PowerShell, desde la raíz del repositorio, configurá tus propios datos de conexión:

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="1433"
$env:DB_NAME="Zenoir_Replica"
$env:DB_USER="sa"
$env:DB_PASSWORD="tu_password"
cd zenoirprod
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=sqlsrv"
```

En Bash/WSL, desde la raíz:

```bash
cd zenoirprod
export DB_HOST=localhost DB_PORT=1433 DB_NAME=Zenoir_Replica DB_USER=sa
read -rsp 'Contraseña SQL Server: ' DB_PASSWORD; echo
export DB_PASSWORD
bash ./mvnw spring-boot:run -Dspring-boot.run.profiles=sqlsrv
```

Para instancias con nombre, usá la URL de conexión explicada en el README general.
Esperá el mensaje `Started ZenoirprodApplication`: Hibernate genera las tablas a
partir de las entidades existentes (`ddl-auto=update`). Después detené la API con
Ctrl+C antes de cargar el seed. No hay que ejecutar un esquema SQL adicional.

## 2. Cargar el seed una sola vez

En **SQL Server Management Studio**, conectate a esa misma instancia, abrí
`zenoirprod/database/seed/catalogo.sql` y seleccioná **Zenoir_Replica** en el selector
de base de datos de la ventana. Ejecutá todo el archivo con F5. No requiere modo SQLCMD.
El resultado esperado es `Seed cargado correctamente.`

Alternativa con **sqlcmd**, desde la raíz del repositorio (solicita tu contraseña):

```text
sqlcmd -S localhost,1433 -U sa -C -b -d Zenoir_Replica -i zenoirprod/database/seed/catalogo.sql
```

Ajustá servidor, puerto, usuario y base a tu instalación. En WSL puede ser necesario
usar `/opt/mssql-tools18/bin/sqlcmd` como comando. Las rutas de los ejemplos son
relativas a la raíz del repositorio; no dependen de una máquina particular.

El script ocupa aproximadamente 16 MiB porque incluye las 26 imágenes en hexadecimal,
con sus metadatos y bytes originales. No hay que copiar flyers a ninguna carpeta:
la API los sirve desde la base, como hace actualmente. La carga puede tardar unos segundos.

La operación usa una transacción y conserva los IDs y los contadores de identidad
de las tablas con datos. Si cualquiera de las tablas tiene filas, rechaza la carga
con `El seed requiere una base vacia`, sin borrar ni mezclar información. No se carga
automáticamente al arrancar y no cambia los datos en cada reinicio.

## 3. Verificar y abrir la aplicación

Antes de editar o agregar datos, ejecutá `verificar.sql` en la misma base desde SSMS,
o desde la raíz del repositorio:

```text
sqlcmd -S localhost,1433 -U sa -C -b -d Zenoir_Replica -i zenoirprod/database/seed/verificar.sql
```

Debe mostrar `Verificacion correcta: cantidades e imagenes originales.` Comprueba
las cantidades de las 13 tablas y el tamaño y SHA-256 de cada una de las 26 imágenes.

Volvé a iniciar el backend con las mismas variables y el comando del paso 1.
`GET http://localhost:8080/eventos?catalogo=true&page=0&size=6` debe devolver seis
eventos y `totalElements: 8` (con las fechas de la instantánea, al 20/10/2026).

Para iniciar el frontend, en otra terminal desde la raíz del repositorio:

```text
cd frontend
npm install
npm run dev
```

Abrí la URL indicada por Vite. En el inicio deben aparecer los flyers (y, dentro de cada evento, su galería de fotos), la próxima fecha
(After Palace), la cinta con los nombres de los eventos y los dos lugares con su foto.
Entrá a Fechas y probá nombre `Velvet` con categoría `Rock`: debe quedar `Velvet Ritual`.

El proxy usa la API en 8080 por defecto; si tenés un `.env.local` previo, revisá que
`ZENOIR_API_TARGET` apunte al backend que acabás de iniciar.

## Alcance de la instantánea

El seed conserva las fechas originales, no las desplaza respecto del día de carga.
Con el paso del tiempo los eventos pueden dejar de estar en venta o de considerarse
próximos según las reglas existentes de la aplicación. Para volver al estado inicial,
creá otra base vacía y repetí estos pasos.

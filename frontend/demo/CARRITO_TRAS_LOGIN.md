# Continuar la selección después del acceso

Al agregar entradas sin sesión, la selección y los precios vistos se conservan en `sessionStorage` de la pestaña. El login o registro vuelven al evento; una vez cargado el carrito inicial, se revisan precios y disponibilidad y se agregan las entradas. Si sale bien, se abre el carrito. Si cambió precio o stock, se muestra la selección actualizada para revisar. Una contraseña incorrecta no borra la selección.

La intención se consume antes de confirmar para evitar repetir pedidos al volver o recargar. Los errores y agregados parciales siguen el tratamiento del detalle. Salir o ingresar como administrador descarta la intención. Guardar la selección no reserva stock.

## Verificación

- `npm test`: 50 pruebas aprobadas, incluyendo persistencia, recarga, descarte y almacenamiento bloqueado.
- `npm run build` y `npm run lint`: correctos, sin advertencias.
- `node demo/verificar-carrito-login.mjs`: simulación de interfaz con React StrictMode, API simulada y jsdom. Comprueba selección anónima de dos entradas, login fallido, recarga del login, acceso exitoso, carrito con las cantidades originales, ausencia de duplicados y cambios de precio/stock. No realiza reservas ni usa cuentas reales.

El script de interfaz requiere jsdom disponible. Puede usarse una instalación existente indicando la ruta del módulo en `ZENOIR_JSDOM`; no se agregó una dependencia al proyecto.

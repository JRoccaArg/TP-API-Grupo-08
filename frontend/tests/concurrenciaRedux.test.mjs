import { test } from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import { crearStore } from '../src/redux/store.js'
import { login, logout, sesionVencida } from '../src/redux/usuarioSlice.js'
import { obtenerMisCompras, pagarCarrito } from '../src/redux/comprasSlice.js'
import { agregarItem, cambiarCantidad, iniciarPago, obtenerCarrito, quitarItem, vaciarCarrito } from '../src/redux/carritoSlice.js'
import { obtenerCatalogo, seleccionarConsultaCatalogo } from '../src/redux/eventosSlice.js'

const diferido = () => {
  let resolve, reject
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail })
  return { promise, resolve, reject }
}
const avanzar = () => new Promise((resolve) => setImmediate(resolve))
const ingresar = (store, token) => store.dispatch(login.fulfilled({ token, rol: 'USER' }, `login-${token}`, {}))
const carrito = (items = [], estado = 'ACTIVO') => ({ id: 1, items, estado, total: items.length * 100 })
const pagina = (...content) => ({ content, totalElements: content.length, totalPages: 1 })

test('un login atrasado tampoco reemplaza la sesión persistida de otra cuenta', async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  let guardada
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    setItem: (_key, value) => { guardada = JSON.parse(value) },
  } })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  })
  const ana = diferido(), bruno = diferido()
  t.mock.method(axios, 'post', (_url, body) => body.email === 'ana@example.com' ? ana.promise : bruno.promise)
  const store = crearStore()
  const a = store.dispatch(login({ email: 'ana@example.com', password: 'demo' }))
  const b = store.dispatch(login({ email: 'bruno@example.com', password: 'demo' }))
  bruno.resolve({ data: { access_token: 'B', nombre: 'Bruno', apellido: '', role: 'USER' } })
  await b
  ana.resolve({ data: { access_token: 'A', nombre: 'Ana', apellido: '', role: 'USER' } })
  await a
  assert.equal(store.getState().usuario.sesion.token, 'B')
  assert.equal(guardada.token, 'B')
})

for (const salir of [logout, sesionVencida]) {
  for (const falla of [false, true]) {
    test(`${salir.type}: una respuesta ${falla ? 'fallida' : 'exitosa'} de Ana no afecta a Bruno`, async (t) => {
      const ana = diferido(), bruno = diferido()
      t.mock.method(axios, 'get', (_url, config) => config.headers.Authorization === 'Bearer A' ? ana.promise : bruno.promise)
      const store = crearStore()
      ingresar(store, 'A')
      const primero = store.dispatch(obtenerMisCompras('A'))
      store.dispatch(salir())
      ingresar(store, 'B')
      const segundo = store.dispatch(obtenerMisCompras('B'))
      bruno.resolve({ data: pagina({ id: 20 }) })
      await segundo
      if (falla) ana.reject(new Error('Error de Ana'))
      else ana.resolve({ data: pagina({ id: 10 }) })
      await primero
      assert.deepEqual(store.getState().compras.items, [{ id: 20 }])
      assert.equal(store.getState().compras.error, null)
      assert.equal(store.getState().compras.cargado, true)
    })
  }
}

test('dos agregados y una lectura usan la misma cola y conservan las dos entradas', async (t) => {
  const pedidos = []
  const guardar = (url, body) => {
    const pedido = diferido()
    pedidos.push({ ...pedido, url, body })
    return pedido.promise
  }
  t.mock.method(axios, 'get', (url) => guardar(url))
  t.mock.method(axios, 'post', guardar)
  const store = crearStore()
  ingresar(store, 'A')
  const lectura = store.dispatch(obtenerCarrito('A'))
  const general = store.dispatch(agregarItem({ token: 'A', eventoTipoEntradaId: 1, cantidad: 1 }))
  const vip = store.dispatch(agregarItem({ token: 'A', eventoTipoEntradaId: 2, cantidad: 1 }))
  await avanzar()
  assert.equal(pedidos.length, 1, 'solo sale la lectura inicial')
  pedidos[0].resolve({ data: carrito() })
  await lectura
  await avanzar()
  assert.equal(pedidos.length, 2)
  assert.equal(pedidos[1].body.eventoTipoEntradaId, 1)
  pedidos[1].resolve({ data: carrito([{ id: 1 }]) })
  await general
  await avanzar()
  assert.equal(store.getState().carrito.guardando, true, 'VIP todavía está pendiente')
  assert.equal(store.getState().carrito.agregando, 2)
  assert.equal(pedidos.length, 3)
  pedidos[2].resolve({ data: carrito([{ id: 1 }, { id: 2 }]) })
  await vip
  assert.equal(store.getState().carrito.carrito.items.length, 2)
  assert.equal(store.getState().carrito.guardando, false)
  assert.deepEqual(store.getState().carrito.pendientes, {})
})

test('un fallo no bloquea la cola y todos los cambios, la lectura y el pago se ordenan', async (t) => {
  const pedidos = []
  const guardar = (metodo) => (url) => {
    const pedido = diferido()
    pedidos.push({ ...pedido, metodo, url })
    return pedido.promise
  }
  for (const metodo of ['get', 'post', 'patch', 'delete']) t.mock.method(axios, metodo, guardar(metodo))
  const store = crearStore()
  ingresar(store, 'A')
  const acciones = [
    agregarItem({ token: 'A', eventoTipoEntradaId: 1, cantidad: 1 }),
    cambiarCantidad({ token: 'A', itemId: 1, cantidad: 2 }),
    quitarItem({ token: 'A', itemId: 1 }), vaciarCarrito('A'),
    iniciarPago('A'), obtenerCarrito('A'), pagarCarrito('A'),
  ]
  const promesas = acciones.map((accion) => store.dispatch(accion))
  for (let i = 0; i < acciones.length; i++) {
    await avanzar()
    assert.equal(pedidos.length, i + 1, 'el siguiente HTTP espera al anterior')
    if (i === 0) pedidos[i].reject(new Error('Sin conexión'))
    else pedidos[i].resolve({ data: i === 6 ? { id: 30, detalles: [] } : carrito([{ id: 1 }], 'EN_PAGO') })
    await promesas[i]
  }
  assert.deepEqual(pedidos.map((p) => p.metodo), ['post', 'patch', 'delete', 'post', 'post', 'get', 'post'])
  assert.deepEqual(store.getState().carrito.carrito.items, [])
  assert.equal(store.getState().compras.ultimaCompra.id, 30)
})

test('al salir se descartan respuestas viejas y no se envían cambios que quedaron en espera', async (t) => {
  const viejo = diferido(), enviados = []
  t.mock.method(axios, 'post', (_url, body, config) => {
    enviados.push({ body, token: config.headers.Authorization })
    return config.headers.Authorization === 'Bearer A' ? viejo.promise : Promise.resolve({ data: carrito([{ id: 30 }]) })
  })
  const store = crearStore()
  ingresar(store, 'A')
  const primero = store.dispatch(agregarItem({ token: 'A', eventoTipoEntradaId: 1, cantidad: 1 }))
  const enEspera = store.dispatch(agregarItem({ token: 'A', eventoTipoEntradaId: 2, cantidad: 1 }))
  await avanzar()
  store.dispatch(logout())
  ingresar(store, 'B')
  await store.dispatch(agregarItem({ token: 'B', eventoTipoEntradaId: 3, cantidad: 1 }))
  assert.equal(enviados.length, 2, 'Bruno no espera al pedido de Ana')
  viejo.resolve({ data: carrito([{ id: 10 }]) })
  await Promise.all([primero, enEspera])
  assert.equal(enviados.length, 2, 'la segunda modificación de Ana nunca salió')
  assert.deepEqual(store.getState().carrito.carrito.items, [{ id: 30 }])
})

test('el catálogo actualiza un evento conocido conservando sus fotos y ofertas', async (t) => {
  let respuesta = pagina({ id: 7, titulo: 'Viernes', imagenes: [{ id: 8 }], ofertas: [{ id: 9 }] })
  t.mock.method(axios, 'get', async () => ({ data: respuesta }))
  const store = crearStore()
  await store.dispatch(obtenerCatalogo('page=0'))
  respuesta = pagina({ id: 7, titulo: 'Sábado', estado: 'ACTIVO' })
  await store.dispatch(obtenerCatalogo('nombre=sabado'))
  await store.dispatch(obtenerCatalogo('nombre=sabado'))
  assert.deepEqual(store.getState().eventos.items, [{ id: 7, titulo: 'Sábado', estado: 'ACTIVO', imagenes: [{ id: 8 }], ofertas: [{ id: 9 }] }])
  assert.equal(store.getState().eventos.paginas.length, 2, 'no duplica la página al volver a consultarla')
})

test('un error tardío de rock no afecta la búsqueda de electrónica', async (t) => {
  const rock = diferido(), electro = diferido()
  t.mock.method(axios, 'get', (url) => url.includes('rock') ? rock.promise : electro.promise)
  const store = crearStore()
  const a = store.dispatch(obtenerCatalogo('nombre=rock'))
  const b = store.dispatch(obtenerCatalogo('nombre=electronica'))
  electro.resolve({ data: pagina({ id: 2 }) })
  await b
  rock.reject(new Error('Falló rock'))
  await a
  assert.equal(seleccionarConsultaCatalogo(store.getState(), 'nombre=rock').error, 'Falló rock')
  assert.equal(seleccionarConsultaCatalogo(store.getState(), 'nombre=electronica').error, null)
  assert.equal(seleccionarConsultaCatalogo(store.getState(), 'nombre=electronica').loading, false)
  assert.deepEqual(store.getState().eventos.paginas[0].ids, [2])
})

for (const falla of [false, true]) {
  test(`dos pedidos de la misma consulta: descarta la respuesta vieja ${falla ? 'fallida' : 'exitosa'}`, async (t) => {
    const viejo = diferido(), nuevo = diferido()
    let llamados = 0
    t.mock.method(axios, 'get', () => (++llamados === 1 ? viejo.promise : nuevo.promise))
    const store = crearStore()
    const a = store.dispatch(obtenerCatalogo('nombre=rock'))
    const b = store.dispatch(obtenerCatalogo('nombre=rock'))
    nuevo.resolve({ data: pagina({ id: 2 }) })
    await b
    if (falla) viejo.reject(new Error('Respuesta vieja'))
    else viejo.resolve({ data: pagina({ id: 1 }) })
    await a
    assert.deepEqual(store.getState().eventos.paginas[0].ids, [2])
    assert.equal(seleccionarConsultaCatalogo(store.getState(), 'nombre=rock').error, null)
  })
}

test('la pantalla mantiene electrónica visible cuando falla la búsqueda anterior de rock', async () => {
  const { createServer } = await import('vite')
  const { createElement } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { Provider } = await import('react-redux')
  const { MemoryRouter } = await import('react-router-dom')
  const { consultaCatalogo } = await import('../src/utils/filtrosCatalogo.js')
  const servidor = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' })
  try {
    const SeccionFechas = (await servidor.ssrLoadModule('/src/components/SeccionFechas.jsx')).default
    const store = crearStore()
    const rock = consultaCatalogo({ busqueda: 'rock' })
    const electronica = consultaCatalogo({ busqueda: 'electronica' })
    store.dispatch(obtenerCatalogo.pending('A', rock))
    store.dispatch(obtenerCatalogo.pending('B', electronica))
    store.dispatch(obtenerCatalogo.fulfilled(pagina({ id: 7, titulo: 'Noche electrónica', estado: 'ACTIVO', ofertas: [], imagenes: [] }), 'B', electronica))
    store.dispatch(obtenerCatalogo.rejected(new Error('Falló rock'), 'A', rock))
    const html = renderToStaticMarkup(createElement(Provider, { store },
      createElement(MemoryRouter, { initialEntries: ['/?q=electronica'] }, createElement(SeccionFechas))))
    assert.match(html, /Noche electrónica/)
    assert.doesNotMatch(html, /Falló rock/)
  } finally {
    await servidor.close()
  }
})

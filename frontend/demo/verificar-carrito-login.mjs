import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { JSDOM } = await import(process.env.ZENOIR_JSDOM || 'jsdom')
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/eventos/7' })
for (const key of ['window', 'document', 'HTMLElement', 'Event', 'MouseEvent', 'sessionStorage', 'localStorage']) globalThis[key] = dom.window[key]
globalThis.IS_REACT_ACT_ENVIRONMENT = true
window.scrollTo = () => {}
const { createElement: h, act, StrictMode } = require('react')
const { createRoot } = require('react-dom/client')
const { MemoryRouter, useLocation } = require('react-router-dom')
const { createServer } = await import(require.resolve('vite'))
const server = await createServer({ root: new URL('..', import.meta.url).pathname, server: { middlewareMode: true }, appType: 'custom' })
const App = (await server.ssrLoadModule('/src/App.jsx')).default
const pending = await server.ssrLoadModule('/src/utils/seleccionPendiente.js')
let price = 15000, stock = 10, posts = [], failedLogin = false
const event = { id: 7, titulo: 'Evento de prueba', fechaHoraInicio: '2027-01-01T23:00:00', fechaHoraFin: '2027-01-02T06:00:00', estado: 'ACTIVO' }
const offer = () => ({ id: 12, tipoEntradaNombre: 'General', estado: 'ACTIVO', cantidadDisponible: stock, precioFinal: price })
const empty = { id: 1, estado: 'ACTIVO', items: [], total: 0, fechaVencimiento: null }
let cart = empty
const jwt = `e30.${Buffer.from(JSON.stringify({ exp: 9999999999 })).toString('base64')}.firma`
globalThis.fetch = async (url, options = {}) => {
  const path = String(url).split('?')[0]
  let data
  if (path.endsWith('/authenticate')) {
    if (failedLogin) return new Response(JSON.stringify({ message: 'Credenciales incorrectas' }), { status: 401 })
    data = { access_token: jwt, role: 'USER', email: 'prueba@example.com', nombre: 'Prueba', apellido: 'Carrito' }
  } else if (path.endsWith('/eventos/7')) data = event
  else if (path.endsWith('/evento/7')) data = { content: [offer()], totalPages: 1 }
  else if (path.endsWith('/imagenes')) data = { content: [], totalPages: 0 }
  else if (path.endsWith('/disponibilidad')) data = stock >= 2
  else if (path.endsWith('/carritos/activo/items')) {
    assert.ok(options.headers.Authorization.includes(jwt))
    posts.push(JSON.parse(options.body))
    cart = { ...empty, total: 30000, items: [{ id: 1, eventoId: 7, eventoTitulo: event.titulo, tipoEntradaNombre: 'General', cantidad: 2, precioUnitario: 15000, subtotal: 30000 }] }
    data = cart
  } else if (path.endsWith('/carritos/activo')) {
    // Simula una carga lenta: debe terminar antes de cualquier POST.
    await new Promise(resolve => setTimeout(resolve, 30))
    data = cart
  } else throw Error(`Consulta inesperada: ${url}`)
  return new Response(JSON.stringify(data), { status: 200 })
}
function Location() { return h('output', { id: 'ruta' }, useLocation().pathname) }
const tick = async () => { await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)) }) }
async function until(predicate) { for (let i = 0; i < 30; i++) { if (predicate()) return; await tick() } throw Error('Timeout: '+document.body.textContent) }
const button = text => [...document.querySelectorAll('button')].find(el => el.textContent === text)
async function click(el) { assert.ok(el); await act(async () => el.click()) }
async function mount(path = '/eventos/7') {
  const root = createRoot(document.getElementById('root'))
  await act(async () => root.render(h(StrictMode, null, h(MemoryRouter, { initialEntries: [path] }, h(App), h(Location)))))
  return root
}
async function submitLogin() { await act(async () => document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))) }
async function unmount(root) { await act(async () => root.unmount()) }
try {
  let root = await mount()
  await until(() => document.querySelector('[aria-label="Agregar una entrada General"]'))
  await click(document.querySelector('[aria-label="Agregar una entrada General"]'))
  await click(document.querySelector('[aria-label="Agregar una entrada General"]'))
  await click(button('Agregar al carrito'))
  await until(() => document.getElementById('ruta').textContent === '/login')
  assert.deepEqual(pending.leerSeleccionPendiente().seleccion, [{ ofertaId: 12, cantidad: 2 }])
  failedLogin = true
  await submitLogin(); await until(() => document.body.textContent.includes('Credenciales incorrectas'))
  assert.ok(pending.leerSeleccionPendiente()); assert.equal(posts.length, 0)
  await unmount(root)
  // Recarga de la pantalla de login, manteniendo sessionStorage.
  root = await mount('/login'); failedLogin = false
  await submitLogin()
  await until(() => document.getElementById('ruta').textContent === '/carrito')
  assert.deepEqual(posts, [{ eventoTipoEntradaId: 12, cantidad: 2 }])
  assert.match(document.body.textContent, /Evento de prueba/)
  await tick(); assert.equal(posts.length, 1)
  await unmount(root)
  root = await mount('/eventos/7'); await tick(); assert.equal(posts.length, 1)
  await unmount(root)
  console.log('OK: selección anónima, login fallido, recarga, login exitoso y carrito con 2 entradas sin duplicados en StrictMode.')
  for (const change of ['precio', 'stock']) {
    localStorage.clear(); cart = empty; posts = []; price = 15000; stock = 10
    pending.guardarSeleccionPendiente({ ...event, ofertas: [offer()] }, [{ ofertaId: 12, cantidad: 2 }], '/')
    if (change === 'precio') price = 18000
    else stock = 1
    root = await mount('/login'); await submitLogin()
    await until(() => document.body.textContent.includes('La disponibilidad o los precios cambiaron'))
    assert.equal(posts.length, 0)
    assert.equal(document.getElementById('ruta').textContent, '/eventos/7')
    await unmount(root)
    console.log(`OK: cambio de ${change} pide revisar y no agrega automáticamente.`)
  }
} finally { await server.close(); dom.window.close() }

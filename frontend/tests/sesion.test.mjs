import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import usuarioReducer, { login, logout, registrar, sesionVencida } from '../src/redux/usuarioSlice.js'
import { tokenVencido, vencimientoDelToken } from '../src/utils/sesion.js'

test('el aviso de acceso pide ingresar sin sesión y explica para quién es la pantalla con sesión', async () => {
  const servidor = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const AvisoAcceso = (await servidor.ssrLoadModule('/src/components/AvisoAcceso.jsx')).default
    const ver = (usuario, para) => renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(AvisoAcceso, { usuario, para, sinSesion: 'Ingresá para ver tu carrito.' })))
    assert.match(ver(null, 'USER'), /Ingresá para ver tu carrito/)
    assert.match(ver(null, 'USER'), />Ingresar</)
    // Un administrador en una pantalla de compradores no ve "Ingresá" (ya ingresó).
    assert.doesNotMatch(ver({ rol: 'ADMIN' }, 'USER'), />Ingresar</)
    assert.match(ver({ rol: 'ADMIN' }, 'USER'), /administrador no tiene carrito/)
    // Y un usuario común en el panel de admin tampoco.
    assert.doesNotMatch(ver({ rol: 'USER' }, 'ADMIN'), />Ingresar</)
    assert.match(ver({ rol: 'USER' }, 'ADMIN'), /solo para administradores/)
  } finally {
    await servidor.close()
  }
})

// Un JWT de prueba: el front solo lee "exp" (en segundos); la firma la revisa el back
const tokenQueVence = (exp) => `cabecera.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.firma`

describe('el reloj de la sesión', () => {
  test('lee del token a qué hora vence', () => {
    const token = tokenQueVence(2000000000)
    assert.equal(vencimientoDelToken(token), 2000000000 * 1000)
    assert.equal(tokenVencido(token, 1999999999 * 1000), false)
    assert.equal(tokenVencido(token, 2000000000 * 1000), true)
  })
  test('un token que no se puede leer cuenta como vencido', () => {
    assert.equal(vencimientoDelToken('cualquier-cosa'), null)
    assert.equal(tokenVencido('cualquier-cosa'), true)
  })
})

// Los reducers son funciones puras: se les pasa un estado y la acción que despacha el middleware cuando responde el back.
describe('el slice del usuario', () => {
  const inicio = usuarioReducer(undefined, { type: 'inicio' })
  const sesion = { token: 'T', email: 'lucia@mail.com', nombre: 'Lucia Perez', rol: 'USER' }
  const credenciales = { email: 'lucia@mail.com', password: 'clave' }

  test('sin una sesión guardada arranca sin sesión', () => {
    assert.equal(inicio.sesion, null)
    assert.equal(inicio.vencida, false)
  })
  test('el login guarda la sesión que armó el thunk; si falla, queda el mensaje del back', () => {
    assert.deepEqual(usuarioReducer(inicio, login.fulfilled(sesion, 'pedido', credenciales)).sesion, sesion)
    const fallo = usuarioReducer(inicio, login.rejected(null, 'pedido', credenciales, 'El email o la contrasena son incorrectos'))
    assert.equal(fallo.error, 'El email o la contrasena son incorrectos')
    assert.equal(fallo.sesion, null)
    assert.equal(fallo.loading, false)
  })
  test('registrarse también deja la sesión iniciada', () => {
    assert.deepEqual(usuarioReducer(inicio, registrar.fulfilled(sesion, 'pedido', {})).sesion, sesion)
  })
  test('salir la borra; si vence, además queda el aviso hasta volver a ingresar', () => {
    const conSesion = usuarioReducer(inicio, login.fulfilled(sesion, 'pedido', credenciales))
    assert.equal(usuarioReducer(conSesion, logout()).sesion, null)
    const vencida = usuarioReducer(conSesion, sesionVencida())
    assert.equal(vencida.sesion, null)
    assert.equal(vencida.vencida, true)
    assert.equal(usuarioReducer(vencida, login.fulfilled(sesion, 'pedido', credenciales)).vencida, false)
    assert.equal(usuarioReducer(vencida, logout()).vencida, false)
  })
})

describe('login y registro con el store', () => {
  let servidor, store, Login, Registro
  before(async () => {
    servidor = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' }) // sin WebSocket: evita chocar de puerto con otros tests
    store = (await servidor.ssrLoadModule('/src/redux/store.js')).store
    Login = (await servidor.ssrLoadModule('/src/views/Login.jsx')).default
    Registro = (await servidor.ssrLoadModule('/src/views/Registro.jsx')).default
  })
  after(async () => { await servidor?.close() })

  const ver = (Pantalla) => renderToStaticMarkup(createElement(Provider, { store },
    createElement(MemoryRouter, null, createElement(Pantalla))))

  test('el error de un login anterior no aparece al volver a abrir el login ni en el registro', () => {
    store.dispatch(login.rejected(null, 'pedido', { email: 'a@b.com', password: 'x' }, 'El email o la contrasena son incorrectos'))
    assert.doesNotMatch(ver(Login), /incorrectos/)
    assert.doesNotMatch(ver(Registro), /incorrectos/)
  })
  test('cuando la sesión llega al store, el login deja de mostrar el formulario (lleva a otra pantalla)', () => {
    assert.match(ver(Login), /<form/)
    store.dispatch(login.fulfilled({ token: 'T', email: 'a@b.com', nombre: 'Ana Gomez', rol: 'USER' }, 'pedido', {}))
    assert.doesNotMatch(ver(Login), /<form/)
    assert.doesNotMatch(ver(Registro), /<form/)
    store.dispatch(logout())
  })
})

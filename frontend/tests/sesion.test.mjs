import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { consultar } from '../src/utils/apiEventos.js'
import { avisarSiVenceLaSesion, pedir } from '../src/utils/pedir.js'

const fetchOriginal = globalThis.fetch
afterEach(() => { globalThis.fetch = fetchOriginal })
const responder = (estado, cuerpo = { message: 'x' }) => new Response(JSON.stringify(cuerpo), { status: estado })

test('un 401 cierra la sesión; un 403 no (la sesión sirve, falta permiso)', async () => {
  let cierres = 0
  avisarSiVenceLaSesion(() => { cierres += 1 })
  globalThis.fetch = async () => responder(401)
  await assert.rejects(pedir('GET', '/carritos/activo', 'T'), (error) => error.estado === 401 && /venció/.test(error.message))
  assert.equal(cierres, 1)
  globalThis.fetch = async () => responder(403)
  await assert.rejects(pedir('GET', '/compras/1', 'T'), (error) => error.estado === 403 && /permiso/.test(error.message))
  globalThis.fetch = async () => responder(409, { message: 'Sin stock' })
  await assert.rejects(pedir('POST', '/compras', 'T'), (error) => error.estado === 409 && error.message === 'Sin stock')
  assert.equal(cierres, 1)
  avisarSiVenceLaSesion(() => {})
})

test('las consultas públicas mandan la sesión solo cuando se les da un token', async () => {
  const cabeceras = []
  globalThis.fetch = async (ruta, opciones) => { cabeceras.push(opciones.headers); return responder(200, { ok: true }) }
  await consultar('/eventos/1')
  await consultar('/eventos/1', 'T0K')
  assert.equal(cabeceras[0].Authorization, undefined)
  assert.equal(cabeceras[1].Authorization, 'Bearer T0K')
})

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

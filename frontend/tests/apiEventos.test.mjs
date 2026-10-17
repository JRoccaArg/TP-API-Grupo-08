import { afterEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  consultar, consultarPaginas, ErrorApi, obtenerCatalogo, obtenerEvento, verificarSeleccion,
} from '../src/utils/apiEventos.js'

const fetchOriginal = globalThis.fetch
const responder = (datos, estado = 200) => new Response(JSON.stringify(datos), {
  status: estado, headers: { 'Content-Type': 'application/json' },
})
const pagina = (elementos, numero = 0) => ({
  content: elementos.slice(numero * 100, (numero + 1) * 100),
  totalPages: Math.ceil(elementos.length / 100),
})
const evento = (id, cambios = {}) => ({
  id, titulo: `Evento ${id}`, estado: 'ACTIVO', fechaHoraInicio: '2026-10-31T22:00:00', ...cambios,
})
function simularFetch(resolver) {
  const llamadas = []
  globalThis.fetch = async (ruta, opciones) => {
    const url = new URL(ruta, 'http://frontend.test')
    llamadas.push({ url, opciones })
    return resolver(url, opciones)
  }
  return llamadas
}
function verificarGetPaginados(llamadas, signal) {
  for (const { url, opciones } of llamadas) {
    assert.equal(opciones.method ?? 'GET', 'GET')
    assert.equal(opciones.headers.Accept, 'application/json')
    assert.equal(opciones.headers.Authorization, undefined)
    assert.equal(opciones.signal, signal)
    if (url.search) {
      assert.match(url.searchParams.get('page'), /^\d+$/)
      assert.equal(url.searchParams.get('size'), '100')
      assert.deepEqual([...url.searchParams.keys()].sort(), ['page', 'size'])
    }
  }
}

afterEach(() => { globalThis.fetch = fetchOriginal })

// Cada prueba restaura fetch y se ejecuta secuencialmente: ningún mock alcanza la API real.
describe('consultas públicas del catálogo', { concurrency: false }, () => {
  test('reúne más de cien eventos y todas las páginas antes de completar y ordenar', async () => {
    const eventos = Array.from({ length: 205 }, (_, i) => evento(205 - i))
    eventos.push(evento(206, { estado: 'BORRADOR' }))
    const signal = new AbortController().signal
    const llamadas = simularFetch((url) => {
      if (url.pathname === '/api/eventos') return responder(pagina(eventos, Number(url.searchParams.get('page'))))
      if (/^\/api\/eventosTiposEntrada\/evento\/\d+$/.test(url.pathname) ||
          /^\/api\/eventos\/\d+\/imagenes$/.test(url.pathname)) return responder(pagina([]))
      throw new Error(`Consulta inesperada: ${url}`)
    })
    const catalogo = await obtenerCatalogo(signal)
    assert.equal(catalogo.length, 205)
    assert.deepEqual(catalogo.map(e => e.id), Array.from({ length: 205 }, (_, i) => i + 1))
    assert.equal(llamadas.filter(l => l.url.pathname === '/api/eventos').length, 3)
    assert.equal(llamadas.length, 3 + 205 * 2)
    assert.ok(catalogo.every(e => Array.isArray(e.ofertas) && Array.isArray(e.imagenes)))
    verificarGetPaginados(llamadas, signal)
  })

  test('reúne todas las ofertas e imágenes y ordena portada antes que galería y luego orden', async () => {
    const ofertas = Array.from({ length: 203 }, (_, i) => ({ id: i + 1, precioFinal: 9.99 }))
    const imagenes = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1, tipoImagenEvento: 'GALERIA', orden: 100 - i,
    }))
    imagenes.push(
      { id: 101, tipoImagenEvento: 'PORTADA', orden: 1 },
      { id: 102, tipoImagenEvento: 'GALERIA', orden: -2 },
      { id: 103, tipoImagenEvento: 'PORTADA', orden: 4 },
    )
    const llamadas = simularFetch((url) => {
      if (url.pathname === '/api/eventos/42') return responder(evento(42))
      const numero = Number(url.searchParams.get('page'))
      if (url.pathname === '/api/eventosTiposEntrada/evento/42') return responder(pagina(ofertas, numero))
      if (url.pathname === '/api/eventos/42/imagenes') return responder(pagina(imagenes, numero))
      throw new Error(`Consulta inesperada: ${url}`)
    })
    const detalle = await obtenerEvento(42)
    assert.equal(detalle.ofertas.length, 203)
    assert.equal(detalle.ofertas.at(-1).id, 203)
    assert.equal(detalle.imagenes.length, 103)
    assert.deepEqual(detalle.imagenes.slice(0, 3).map(i => i.id), [101, 103, 102])
    assert.equal(detalle.imagenes[0].url, '/api/eventos/42/imagenes/101/archivo')
    assert.equal(detalle.imagenes.at(-1).id, 1)
    assert.equal(llamadas.filter(l => l.url.pathname.includes('eventosTiposEntrada')).length, 3)
    assert.equal(llamadas.filter(l => l.url.pathname.endsWith('/imagenes')).length, 2)
    verificarGetPaginados(llamadas)
  })

  test('una página posterior fallida rechaza el catálogo completo sin mostrar uno parcial', async () => {
    const llamadas = simularFetch((url) => {
      assert.equal(url.pathname, '/api/eventos')
      if (url.searchParams.get('page') === '0') return responder({ content: [evento(1)], totalPages: 2 })
      return responder({ message: 'Servicio temporalmente no disponible' }, 503)
    })
    await assert.rejects(obtenerCatalogo(), error =>
      error instanceof ErrorApi && error.estado === 503 && error.message === 'Servicio temporalmente no disponible')
    assert.equal(llamadas.length, 2)
  })

  test('recupera errores auxiliares y conserva el evento con mensajes visibles', async () => {
    simularFetch((url) => {
      if (url.pathname === '/api/eventos') return responder(pagina([evento(8)]))
      if (url.pathname.includes('eventosTiposEntrada')) return responder({ message: 'No se pudieron consultar entradas' }, 503)
      if (url.pathname.endsWith('/imagenes')) throw new TypeError('fetch failed')
      throw new Error(`Consulta inesperada: ${url}`)
    })
    const [e] = await obtenerCatalogo()
    assert.equal(e.id, 8)
    assert.deepEqual(e.ofertas, [])
    assert.deepEqual(e.imagenes, [])
    assert.equal(e.errorOfertas, 'No se pudieron consultar entradas')
    assert.match(e.errorImagenes, /conectarnos/)
  })

  test('si falla otra página de ofertas no presenta ofertas parciales y conserva las imágenes', async () => {
    simularFetch((url) => {
      if (url.pathname === '/api/eventos/8') return responder(evento(8))
      if (url.pathname.endsWith('/imagenes')) return responder(pagina([{ id: 9, tipoImagenEvento: 'GALERIA', orden: 1 }]))
      if (url.searchParams.get('page') === '0') return responder({ content: [{ id: 1, precioFinal: 10 }], totalPages: 2 })
      return responder({ message: 'Falló la segunda página' }, 500)
    })
    const e = await obtenerEvento(8)
    assert.deepEqual(e.ofertas, [])
    assert.equal(e.errorOfertas, 'Falló la segunda página')
    assert.equal(e.imagenes[0].url, '/api/eventos/8/imagenes/9/archivo')
    assert.equal(e.errorImagenes, '')
  })

  test('propaga AbortError auxiliar sin convertir una cancelación en un catálogo parcial', async () => {
    const abortado = new DOMException('Solicitud cancelada', 'AbortError')
    const signal = new AbortController().signal
    const llamadas = simularFetch((url) => {
      if (url.pathname === '/api/eventos') return responder(pagina([evento(8)]))
      if (url.pathname.includes('eventosTiposEntrada')) throw abortado
      return responder(pagina([]))
    })
    await assert.rejects(obtenerCatalogo(signal), error => error === abortado)
    verificarGetPaginados(llamadas, signal)
  })

  test('normaliza errores de red y conserva el mensaje HTTP del backend', async () => {
    simularFetch(() => { throw new TypeError('Network failure') })
    await assert.rejects(consultar('/eventos/1'), error =>
      error instanceof ErrorApi && /conectarnos/.test(error.message) && error.estado === undefined)
    simularFetch(() => responder({ message: 'El evento no existe' }, 404))
    await assert.rejects(consultar('/eventos/999'), error =>
      error instanceof ErrorApi && error.estado === 404 && error.message === 'El evento no existe')
  })

  test('maneja JSON malformado y respuestas de error del proxy sin JSON', async () => {
    simularFetch(() => new Response('<html>Proxy</html>', { status: 200 }))
    await assert.rejects(consultar('/eventos/1'), error =>
      error instanceof ErrorApi && /datos esperados/.test(error.message))
    simularFetch(() => new Response('Bad Gateway', { status: 502 }))
    await assert.rejects(consultar('/eventos/1'), error =>
      error instanceof ErrorApi && error.estado === 502 && /consultar el servidor/.test(error.message))
  })

  test('rechaza páginas con estructura inválida y propaga la cancelación de la consulta principal', async () => {
    for (const datos of [{ content: {}, totalPages: 1 }, { content: [], totalPages: -1 }, { content: [], totalPages: 1.5 }]) {
      simularFetch(() => responder(datos))
      await assert.rejects(consultarPaginas('/eventos'), error =>
        error instanceof ErrorApi && /formato inesperado/.test(error.message))
    }
    const abortado = new DOMException('Solicitud cancelada', 'AbortError')
    simularFetch(() => { throw abortado })
    await assert.rejects(consultar('/eventos/1'), error => error === abortado)
  })
})

test('antes de integrar detecta cambios de precio aunque el total de dos ofertas sea el mismo', async () => {
  const ofertas = [
    { id: 1, estado: 'ACTIVO', cantidadDisponible: 10, precioFinal: 10 },
    { id: 2, estado: 'ACTIVO', cantidadDisponible: 10, precioFinal: 20 },
  ]
  const actualizadas = [{ ...ofertas[0], precioFinal: 11 }, { ...ofertas[1], precioFinal: 19 }]
  const signal = new AbortController().signal
  simularFetch((url, opciones) => {
    assert.equal(opciones.signal, signal)
    if (url.pathname === '/api/eventos/1') return responder(evento(1))
    if (url.pathname.endsWith('/imagenes')) return responder(pagina([]))
    if (url.pathname.endsWith('/disponibilidad')) {
      assert.equal(url.searchParams.get('cantidad'), '1')
      return responder(true)
    }
    if (url.pathname === '/api/eventosTiposEntrada/evento/1') return responder(pagina(actualizadas))
    throw new Error('Consulta inesperada')
  })
  const resultado = await verificarSeleccion({ ...evento(1), ofertas }, [
    { ofertaId: 1, cantidad: 1 }, { ofertaId: 2, cantidad: 1 },
  ], signal)
  assert.equal(resultado.cambio, true)
})

test('antes de integrar vuelve a consultar stock y detecta una cantidad ya no disponible', async () => {
  const entrada = { id: 7, estado: 'ACTIVO', cantidadDisponible: 10, precioFinal: 9 }
  simularFetch((url) => {
    if (url.pathname === '/api/eventos/1') return responder(evento(1))
    if (url.pathname.endsWith('/imagenes')) return responder(pagina([]))
    if (url.pathname.endsWith('/disponibilidad')) return responder(false)
    return responder(pagina([{ ...entrada, cantidadDisponible: 2 }]))
  })
  const resultado = await verificarSeleccion({ ...evento(1), ofertas: [entrada] }, [{ ofertaId: 7, cantidad: 4 }])
  assert.equal(resultado.cambio, true)
  assert.deepEqual(resultado.seleccion, [{ ofertaId: 7, cantidad: 2 }])
})

test('conserva los cuatro eventos y el orden original, con activos antes de finalizados', async () => {
  const originales = [
    evento(3, { titulo: 'Golden Edition', estado: 'FINALIZADO' }),
    evento(2, { titulo: 'Haunted Edition' }),
    evento(4, { titulo: 'Vol. 4 · Secret Location', estado: 'FINALIZADO' }),
    evento(1, { titulo: 'After Palace' }),
  ]
  simularFetch((url) => url.pathname === '/api/eventos' ? responder(pagina(originales)) : responder(pagina([])))
  const catalogo = await obtenerCatalogo()
  assert.deepEqual(catalogo.map(e => e.titulo), [
    'After Palace', 'Haunted Edition', 'Golden Edition', 'Vol. 4 · Secret Location',
  ])
  assert.equal(catalogo.length, 4)
})

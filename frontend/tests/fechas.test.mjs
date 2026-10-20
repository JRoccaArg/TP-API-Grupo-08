import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { esperaProximaFecha } from '../src/utils/fechas.js'

test('la próxima fecha pasada o inválida reintenta en un minuto, no cada milisegundo', () => {
  const ahora = Date.parse('2026-10-18T15:30:00Z')
  assert.equal(esperaProximaFecha('2026-10-18T12:00:00-03:00', ahora), 60000)
  assert.equal(esperaProximaFecha('fecha inválida', ahora), 60000)
})
test('el temporizador futuro conserva su fecha y limita esperas superiores a 32 bits', () => {
  const ahora = Date.parse('2026-10-18T15:30:00Z')
  assert.equal(esperaProximaFecha('2026-10-18T15:30:10Z', ahora), 10001)
  assert.equal(esperaProximaFecha('2027-10-18T15:30:00Z', ahora), 2147483647)
})

for (const TZ of ['UTC', 'America/Argentina/Buenos_Aires', 'America/Los_Angeles', 'Asia/Tokyo']) {
  test(`venta, filtro, selección y presentación respetan Buenos Aires con navegador en ${TZ}`, () => {
    const programa = `
      import assert from 'node:assert/strict';
      import { estadoOferta, ajustarSeleccion } from './src/utils/eventos.js';
      import { precioDesdeEnRango } from './src/utils/filtrosCatalogo.js';
      import { fechaApi, horario, diaYFecha, cuentaRegresiva } from './src/utils/fechas.js';
      const evento = {estado:'ACTIVO'};
      const ahora = Date.parse('2026-10-18T15:30:00Z');
      for (const sufijo of ['', '-03:00']) {
        const oferta = {id:1, estado:'ACTIVO', cantidadDisponible:2, precioFinal:100,
          fechaInicioVenta:'2026-10-18T12:00:00'+sufijo, fechaFinVenta:'2026-10-18T13:00:00'+sufijo};
        assert.equal(estadoOferta(oferta,evento,ahora),'EN_VENTA');
        assert.equal(estadoOferta(oferta,evento,Date.parse('2026-10-18T14:59:59Z')),'PROXIMAMENTE');
        assert.equal(estadoOferta(oferta,evento,Date.parse('2026-10-18T16:00:00Z')),'EN_VENTA');
        assert.equal(estadoOferta(oferta,evento,Date.parse('2026-10-18T16:00:00.001Z')),'FINALIZADO');
        assert.equal(precioDesdeEnRango({...evento, ofertas:[oferta]}, {precioMin:'100',precioMax:'100'}, ahora),100);
        assert.deepEqual(ajustarSeleccion([{ofertaId:1,cantidad:3}],[oferta],evento,ahora),[{ofertaId:1,cantidad:2}]);
      }
      assert.equal(fechaApi('2026-10-18T12:00:00').getTime(),Date.parse('2026-10-18T15:00:00Z'));
      assert.equal(horario('2026-10-18T15:00:00Z','2026-10-18T16:00:00Z'),'12 a 13 h');
      assert.equal(diaYFecha('2026-10-19T01:00:00Z'),'Domingo 18 de octubre');
      assert.equal(cuentaRegresiva('2026-10-18T13:00:00-03:00',ahora).minutos,30);
    `
    execFileSync(process.execPath, ['--input-type=module', '-e', programa], {
      cwd: new URL('../', import.meta.url), env: { ...process.env, TZ },
    })
  })
}

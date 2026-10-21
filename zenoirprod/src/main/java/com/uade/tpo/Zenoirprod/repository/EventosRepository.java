package com.uade.tpo.Zenoirprod.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.uade.tpo.Zenoirprod.entity.Evento;

@Repository
public interface EventosRepository extends JpaRepository<Evento, Integer> {

    // EXISTS evita duplicar eventos con varias ofertas; el WHERE se aplica antes del LIMIT/OFFSET.
    // Orden: catálogo -> fecha de inicio descendente (ascendente con antiguosPrimero); próximo -> fecha ascendente; el resto -> id.
    // El precio final usa la misma cuenta que PrecioCalculator (precio - descuento redondeado).
    @Query("""
            select e from Evento e
            where lower(replace(replace(replace(replace(replace(replace(replace(
                lower(e.titulo), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ü', 'u'), 'ñ', 'n'))
                like :nombre escape '!'
              and (:categoriaId is null or e.categoria.id = :categoriaId)
              and (:catalogo = false or e.estado <> 'BORRADOR')
              and (:proximo = false or (e.estado = 'ACTIVO' and e.fechaHoraInicio >= :ahora))
              and ((:precioMin is null and :precioMax is null) or (e.estado = 'ACTIVO' and exists (
                select o.id from EventoTipoEntrada o where o.evento.id = e.id
                  and o.estado = 'ACTIVO' and o.cantidadDisponible > 0
                  and (o.fechaInicioVenta is null or o.fechaInicioVenta <= :ahora)
                  and (o.fechaFinVenta is null or o.fechaFinVenta >= :ahora)
                  and (:precioMin is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) >= :precioMin)
                  and (:precioMax is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) <= :precioMax)
              )))
            order by case when :proximo = true then e.fechaHoraInicio else null end,
                case when :catalogo = true and :proximo = false and :antiguosPrimero = false then e.fechaHoraInicio else null end desc,
                case when :catalogo = true and :proximo = false and :antiguosPrimero = true then e.fechaHoraInicio else null end asc,
                e.id
            """)
    Page<Evento> buscar(@Param("nombre") String nombre, @Param("categoriaId") Integer categoriaId,
            @Param("precioMin") BigDecimal precioMin, @Param("precioMax") BigDecimal precioMax,
            @Param("catalogo") boolean catalogo, @Param("proximo") boolean proximo,
            @Param("antiguosPrimero") boolean antiguosPrimero,
            @Param("ahora") LocalDateTime ahora, Pageable pageable);

    @Query("""
            select e from Evento e
            where lower(replace(replace(replace(replace(replace(replace(replace(
                lower(e.titulo), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ü', 'u'), 'ñ', 'n'))
                like :nombre escape '!'
              and (:categoriaId is null or e.categoria.id = :categoriaId)
              and (:catalogo = false or e.estado <> 'BORRADOR')
              and :orden in ('proximos', 'lejanos', 'menor-precio', 'mayor-precio')
              and (:estadoEvento = 'todos'
                or (:estadoEvento = 'proximos' and e.estado in ('ACTIVO', 'REPROGRAMADO') and e.fechaHoraInicio > :ahora)
                or (:estadoEvento = 'en-curso' and e.estado = 'ACTIVO' and e.fechaHoraInicio <= :ahora and e.fechaHoraFin > :ahora)
                or (:estadoEvento = 'finalizados' and (e.estado = 'FINALIZADO' or (e.estado in ('ACTIVO', 'REPROGRAMADO') and e.fechaHoraFin <= :ahora)))
                or (:estadoEvento = 'cancelados' and e.estado = 'CANCELADO'))
              and ((:precioMin is null and :precioMax is null) or (e.estado = 'ACTIVO' and exists (
                select o.id from EventoTipoEntrada o where o.evento.id = e.id
                  and o.estado = 'ACTIVO' and o.cantidadDisponible > 0
                  and (o.fechaInicioVenta is null or o.fechaInicioVenta <= :ahora)
                  and (o.fechaFinVenta is null or o.fechaFinVenta >= :ahora)
                  and (:precioMin is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) >= :precioMin)
                  and (:precioMax is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) <= :precioMax)
              )))
            order by
                case when :orden in ('menor-precio', 'mayor-precio') and (select min(o.precio - round(o.precio * o.porcentajeDescuento / 100, 2))
                    from EventoTipoEntrada o where o.evento.id = e.id and e.estado = 'ACTIVO' and e.fechaHoraFin > :ahora
                    and o.estado = 'ACTIVO' and o.cantidadDisponible > 0
                    and (o.fechaInicioVenta is null or o.fechaInicioVenta <= :ahora)
                    and (o.fechaFinVenta is null or o.fechaFinVenta >= :ahora)
                    and (:precioMin is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) >= :precioMin)
                    and (:precioMax is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) <= :precioMax)) is null then 1 else 0 end,
                case when :orden = 'menor-precio' then (select min(o.precio - round(o.precio * o.porcentajeDescuento / 100, 2))
                    from EventoTipoEntrada o where o.evento.id = e.id and e.estado = 'ACTIVO' and e.fechaHoraFin > :ahora
                    and o.estado = 'ACTIVO' and o.cantidadDisponible > 0
                    and (o.fechaInicioVenta is null or o.fechaInicioVenta <= :ahora)
                    and (o.fechaFinVenta is null or o.fechaFinVenta >= :ahora)
                    and (:precioMin is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) >= :precioMin)
                    and (:precioMax is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) <= :precioMax)) else null end asc,
                case when :orden = 'mayor-precio' then (select min(o.precio - round(o.precio * o.porcentajeDescuento / 100, 2))
                    from EventoTipoEntrada o where o.evento.id = e.id and e.estado = 'ACTIVO' and e.fechaHoraFin > :ahora
                    and o.estado = 'ACTIVO' and o.cantidadDisponible > 0
                    and (o.fechaInicioVenta is null or o.fechaInicioVenta <= :ahora)
                    and (o.fechaFinVenta is null or o.fechaFinVenta >= :ahora)
                    and (:precioMin is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) >= :precioMin)
                    and (:precioMax is null or o.precio - round(o.precio * o.porcentajeDescuento / 100, 2) <= :precioMax)) else null end desc,
                case when :orden = 'lejanos' then e.fechaHoraInicio else null end desc,
                case when :orden <> 'lejanos' then e.fechaHoraInicio else null end asc,
                e.id
            """)
    Page<Evento> buscarCatalogo(@Param("nombre") String nombre, @Param("categoriaId") Integer categoriaId,
            @Param("precioMin") BigDecimal precioMin, @Param("precioMax") BigDecimal precioMax,
            @Param("catalogo") boolean catalogo, @Param("estadoEvento") String estadoEvento,
            @Param("orden") String orden,
            @Param("ahora") LocalDateTime ahora, Pageable pageable);

    default Page<Evento> buscar(String nombre, Integer categoriaId, BigDecimal precioMin, BigDecimal precioMax,
            boolean catalogo, boolean proximo, LocalDateTime ahora, Pageable pageable) {
        return buscar(nombre, categoriaId, precioMin, precioMax, catalogo, proximo, false, ahora, pageable);
    }

    @Query("""
            select max(o.precio - round(o.precio * o.porcentajeDescuento / 100, 2))
            from EventoTipoEntrada o where o.evento.estado <> 'BORRADOR'
            """)
    BigDecimal precioMaximoCatalogo();

    @Modifying(clearAutomatically = true)
    @Query("update Evento e set e.estado = 'FINALIZADO' where e.estado = 'ACTIVO' and e.fechaHoraFin <= :ahora")
    int finalizarVencidos(@Param("ahora") LocalDateTime ahora);

    boolean existsByLocacion_Id(Integer locacionId);

    boolean existsByCategoria_Id(Integer categoriaId);

    boolean existsByTitulo(String titulo);

    boolean existsByTituloAndIdNot(String titulo, Integer id);

}

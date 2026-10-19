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

    // EXISTS evita duplicar eventos por sus distintas ofertas. WHERE se ejecuta antes de LIMIT/OFFSET.
    // Orden: catalogo -> fecha de inicio descendente (primero la mas futura) o, con antiguosPrimero, ascendente
    // (primero la mas antigua); proximo -> fecha ascendente; resto -> id.
    // El precio final replica precio - descuento redondeado (PrecioCalculator), no el precio base.
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

    // Orden del catalogo por defecto: la fecha mas futura primero.
    default Page<Evento> buscar(String nombre, Integer categoriaId, BigDecimal precioMin, BigDecimal precioMax,
            boolean catalogo, boolean proximo, LocalDateTime ahora, Pageable pageable) {
        return buscar(nombre, categoriaId, precioMin, precioMax, catalogo, proximo, false, ahora, pageable);
    }

    // Pasa a FINALIZADO los eventos ACTIVOS cuya fecha de fin ya llego. Devuelve cuantos cambio.
    @Modifying(clearAutomatically = true)
    @Query("update Evento e set e.estado = 'FINALIZADO' where e.estado = 'ACTIVO' and e.fechaHoraFin <= :ahora")
    int finalizarVencidos(@Param("ahora") LocalDateTime ahora);

    boolean existsByLocacion_Id(Integer locacionId);

    boolean existsByCategoria_Id(Integer categoriaId);

    boolean existsByTitulo(String titulo);

    boolean existsByTituloAndIdNot(String titulo, Integer id);

}

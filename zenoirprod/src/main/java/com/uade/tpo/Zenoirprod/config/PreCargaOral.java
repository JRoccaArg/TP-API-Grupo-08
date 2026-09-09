package com.uade.tpo.Zenoirprod.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Carrito;
import com.uade.tpo.Zenoirprod.entity.Carrito.EstadoCarrito;
import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.Compra.EstadoCompra;
import com.uade.tpo.Zenoirprod.entity.DetalleCompra;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.ImagenEvento;
import com.uade.tpo.Zenoirprod.entity.ImagenLocacion;
import com.uade.tpo.Zenoirprod.entity.ItemCarrito;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.Role;
import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;
import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.entity.TipoImagenEvento;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.repository.CarritoRepository;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.ImagenEventoRepository;
import com.uade.tpo.Zenoirprod.repository.ImagenLocacionRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@Profile("demo-sqlsrv")
@RequiredArgsConstructor
public class PreCargaOral implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final TipoEntradaRepository tipoEntradaRepository;
    private final EventosRepository eventosRepository;
    private final EventoTipoEntradaRepository eventoTipoEntradaRepository;
    private final ImagenEventoRepository imagenEventoRepository;
    private final ImagenLocacionRepository imagenLocacionRepository;
    private final CarritoRepository carritoRepository;
    private final CompraRepository compraRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {

        /*
         * Evita duplicar la precarga si Spring reinicia el contexto
         * si la aplicacion se reinicia contra la misma base SQL Server.
         */
        if (userRepository.findByEmail("admin@zenoir.demo").isPresent()) {
            System.out.println("=== PRECARGA ORAL YA EXISTENTE ===");
            return;
        }

        LocalDateTime ahora = LocalDateTime.now();

        // ============================================================
        // USUARIOS
        // ============================================================

        User admin = User.builder()
                .firstName("Admin")
                .lastName("Zenoir")
                .dni("30111222")
                .fechaNacimiento(LocalDate.of(1990, 5, 15))
                .email("admin@zenoir.demo")
                .password(passwordEncoder.encode("Admin123"))
                .role(Role.ADMIN)
                .fechaRegistro(ahora.minusDays(30))
                .activo(true)
                .build();

        User sofia = User.builder()
                .firstName("Sofia")
                .lastName("Gomez")
                .dni("40123456")
                .fechaNacimiento(LocalDate.of(2001, 8, 20))
                .email("sofia@zenoir.demo")
                .password(passwordEncoder.encode("Sofia123"))
                .role(Role.USER)
                .fechaRegistro(ahora.minusDays(20))
                .activo(true)
                .build();

        User lucas = User.builder()
                .firstName("Lucas")
                .lastName("Demo")
                .dni("42987654")
                .fechaNacimiento(LocalDate.of(2002, 3, 12))
                .email("lucas@zenoir.demo")
                .password(passwordEncoder.encode("Lucas123"))
                .role(Role.USER)
                .fechaRegistro(ahora.minusDays(5))
                .activo(true)
                .build();

        userRepository.saveAll(List.of(admin, sofia, lucas));

        // ============================================================
        // CATEGORIAS
        // ============================================================

        Category musica = new Category("Musica", true);
        Category comedia = new Category("Comedia", true);
        Category experiencias = new Category("Experiencias", true);

        categoryRepository.saveAll(List.of(musica, comedia, experiencias));

        // ============================================================
        // LOCACIONES
        // ============================================================

        Locacion arena = new Locacion();
        arena.setNombre("Arena Zenoir");
        arena.setDireccion("Av. del Libertador 5000");
        arena.setCapacidadMax(15000);

        Locacion teatro = new Locacion();
        teatro.setNombre("Teatro Central");
        teatro.setDireccion("Av. Corrientes 1200");
        teatro.setCapacidadMax(3000);

        Locacion palacio = new Locacion();
        palacio.setNombre("Palacio Zenoir");
        palacio.setDireccion("Ayacucho 1245, Recoleta");
        palacio.setCapacidadMax(850);

        locationRepository.saveAll(List.of(arena, teatro, palacio));

        // ============================================================
        // TIPOS DE ENTRADA
        // ============================================================

        TipoEntrada general = new TipoEntrada();
        general.setNombre("General");
        general.setDescripcionBase("Acceso general al evento");
        general.setActivo(true);

        TipoEntrada vip = new TipoEntrada();
        vip.setNombre("VIP");
        vip.setDescripcionBase("Acceso preferencial y sector VIP");
        vip.setActivo(true);

        TipoEntrada meet = new TipoEntrada();
        meet.setNombre("Meet & Greet");
        meet.setDescripcionBase("Acceso especial con encuentro con artistas");
        meet.setActivo(true);

        tipoEntradaRepository.saveAll(List.of(general, vip, meet));

        // ============================================================
        // EVENTOS
        // ============================================================

        Evento electronicNight = new Evento();
        electronicNight.setTitulo("Zenoir Electronic Night");
        electronicNight.setDescripcion(
                "Festival nocturno de musica electronica");
        electronicNight.setEstado("ACTIVO");
        electronicNight.setLocacion(arena);
        electronicNight.setCategoria(musica);
        electronicNight.setFechaHoraInicio(
                LocalDateTime.of(2026, 10, 17, 21, 0));
        electronicNight.setFechaHoraFin(
                LocalDateTime.of(2026, 10, 18, 4, 0));

        Evento standUp = new Evento();
        standUp.setTitulo("Noche de Stand Up");
        standUp.setDescripcion(
                "Show de comedia en vivo");
        standUp.setEstado("ACTIVO");
        standUp.setLocacion(teatro);
        standUp.setCategoria(comedia);
        standUp.setFechaHoraInicio(
                LocalDateTime.of(2026, 11, 7, 20, 0));
        standUp.setFechaHoraFin(
                LocalDateTime.of(2026, 11, 7, 22, 30));

        Evento galaZenoir = new Evento();
        galaZenoir.setTitulo("Zenoir: Noche en el Palacio");
        galaZenoir.setDescripcion(
                "Experiencia inmersiva de musica, arte y gastronomia en un palacio historico");
        galaZenoir.setEstado("ACTIVO");
        galaZenoir.setLocacion(palacio);
        galaZenoir.setCategoria(experiencias);
        galaZenoir.setFechaHoraInicio(
                LocalDateTime.of(2026, 10, 3, 20, 0));
        galaZenoir.setFechaHoraFin(
                LocalDateTime.of(2026, 10, 4, 1, 30));

        eventosRepository.saveAll(
                List.of(electronicNight, standUp, galaZenoir));

        // ============================================================
        // IMAGEN DE EVENTO + IMAGEN DE LOCACION
        // ============================================================

        byte[] portada = leerRecurso("demo/zenoir-portada.jpg");
        byte[] galeria = leerRecurso("demo/zenoir-galeria.jpg");
        byte[] exterior = leerRecurso("demo/palacio-exterior.webp");
        byte[] interior = leerRecurso("demo/palacio-interior.jpg");

        imagenEventoRepository.saveAll(List.of(
                crearImagenEvento(galaZenoir, "zenoir-portada.jpg", "image/jpeg",
                        portada, TipoImagenEvento.PORTADA, "Flyer oficial de Zenoir", 1),
                crearImagenEvento(galaZenoir, "zenoir-galeria.jpg", "image/jpeg",
                        galeria, TipoImagenEvento.GALERIA, "Flyer alternativo de Zenoir", 2)
        ));

        imagenLocacionRepository.saveAll(List.of(
                crearImagenLocacion(palacio, "palacio-exterior.webp", "image/webp",
                        exterior, "Fachada del Palacio Zenoir", 1, ahora),
                crearImagenLocacion(palacio, "palacio-interior.jpg", "image/jpeg",
                        interior, "Salon interior del Palacio Zenoir", 2, ahora)
        ));

        // ============================================================
        // EVENTO TIPO ENTRADA - SANTI
        // ============================================================

        EventoTipoEntrada eteGeneralElectronic =
                crearETE(
                        electronicNight,
                        general,
                        "30000",
                        "0",
                        5000,
                        LocalDateTime.of(2026, 9, 1, 0, 0),
                        LocalDateTime.of(2026, 10, 17, 20, 30)
                );

        EventoTipoEntrada eteVipElectronic =
                crearETE(
                        electronicNight,
                        vip,
                        "60000",
                        "15",
                        500,
                        LocalDateTime.of(2026, 9, 1, 0, 0),
                        LocalDateTime.of(2026, 10, 17, 20, 30)
                );

        EventoTipoEntrada eteMeetElectronic =
                crearETE(
                        electronicNight,
                        meet,
                        "90000",
                        "10",
                        100,
                        LocalDateTime.of(2026, 9, 1, 0, 0),
                        LocalDateTime.of(2026, 10, 17, 20, 30)
                );

        EventoTipoEntrada eteGeneralStandUp =
                crearETE(
                        standUp,
                        general,
                        "18000",
                        "0",
                        2500,
                        LocalDateTime.of(2026, 9, 1, 0, 0),
                        LocalDateTime.of(2026, 11, 7, 19, 30)
                );

        EventoTipoEntrada eteVipStandUp =
                crearETE(
                        standUp,
                        vip,
                        "35000",
                        "20",
                        200,
                        LocalDateTime.of(2026, 9, 1, 0, 0),
                        LocalDateTime.of(2026, 11, 7, 19, 30)
                );

        EventoTipoEntrada eteGeneralGala =
                crearETE(
                        galaZenoir,
                        general,
                        "45000",
                        "0",
                        300,
                        LocalDateTime.of(2026, 9, 1, 0, 0),
                        LocalDateTime.of(2026, 10, 3, 19, 30)
                );

        EventoTipoEntrada eteVipGala =
                crearETE(
                        galaZenoir,
                        vip,
                        "85000",
                        "10",
                        50,
                        LocalDateTime.of(2026, 9, 1, 0, 0),
                        LocalDateTime.of(2026, 10, 3, 19, 30)
                );

        EventoTipoEntrada eteMeetGalaAgotada =
                crearETE(
                        galaZenoir,
                        meet,
                        "120000",
                        "0",
                        0,
                        LocalDateTime.of(2026, 9, 1, 0, 0),
                        LocalDateTime.of(2026, 10, 3, 19, 30)
                );
        eteMeetGalaAgotada.setCantidadTotal(20);
        eteMeetGalaAgotada.setEstado(EstadoEventoTipoEntrada.AGOTADO);

        eventoTipoEntradaRepository.saveAll(
                List.of(
                        eteGeneralElectronic,
                        eteVipElectronic,
                        eteMeetElectronic,
                        eteGeneralStandUp,
                        eteVipStandUp,
                        eteGeneralGala,
                        eteVipGala,
                        eteMeetGalaAgotada
                )
        );

        // ============================================================
        // CARRITO YA CONVERTIDO EN COMPRA
        // ============================================================

        ItemCarrito itemComprado = new ItemCarrito();
        itemComprado.setEventoTipoEntrada(eteVipElectronic);
        itemComprado.setCantidad(2);
        itemComprado.setFechaAgregado(
                ahora.minusDays(1).minusMinutes(10));

        Carrito carritoConvertido = new Carrito();
        carritoConvertido.setUsuario(sofia);
        carritoConvertido.setEstado(EstadoCarrito.CONVERTIDO);
        carritoConvertido.setFechaCreacion(
                ahora.minusDays(1).minusMinutes(15));
        carritoConvertido.setFechaActualizacion(
                ahora.minusDays(1));
        carritoConvertido.getItems().add(itemComprado);

        carritoRepository.save(carritoConvertido);

        // ============================================================
        // COMPRA + DETALLE + TICKETS
        // ============================================================

        /*
         * VIP:
         * precio base = 60000
         * descuento = 15%
         * precio final = 51000
         * cantidad = 2
         * total = 102000
         */

        Ticket ticket1 = new Ticket();
        ticket1.setCodigoQr("ORAL-QR-VIP-001");
        ticket1.setEstado(EstadoTicket.EMITIDO);
        ticket1.setFechaEmision(ahora.minusDays(1));

        Ticket ticket2 = new Ticket();
        ticket2.setCodigoQr("ORAL-QR-VIP-002");
        ticket2.setEstado(EstadoTicket.EMITIDO);
        ticket2.setFechaEmision(ahora.minusDays(1));

        DetalleCompra detalle = new DetalleCompra();
        detalle.setEventoTipoEntrada(eteVipElectronic);
        detalle.setCantidad(2);
        detalle.setPrecioUnitario(
                new BigDecimal("51000.00"));
        detalle.setSubtotal(
                new BigDecimal("102000.00"));
        detalle.getTickets().add(ticket1);
        detalle.getTickets().add(ticket2);

        Compra compra = new Compra();
        compra.setUsuario(sofia);
        compra.setCarrito(carritoConvertido);
        compra.setTotal(
                new BigDecimal("102000.00"));
        compra.setEstado(EstadoCompra.CONFIRMADA);
        compra.setFechaCompra(ahora.minusDays(1));
        compra.getDetalles().add(detalle);

        compraRepository.save(compra);

        /*
         * La compra consumio 2 entradas VIP.
         */
        eteVipElectronic.setCantidadDisponible(498);
        eventoTipoEntradaRepository.save(
                eteVipElectronic);

        // ============================================================
        // CARRITO ACTIVO PARA QUE FRANCO PUEDA OPERAR
        // ============================================================

        ItemCarrito itemActivo = new ItemCarrito();
        itemActivo.setEventoTipoEntrada(
                eteGeneralElectronic);
        itemActivo.setCantidad(1);
        itemActivo.setFechaAgregado(ahora);

        Carrito carritoActivo = new Carrito();
        carritoActivo.setUsuario(sofia);
        carritoActivo.setEstado(EstadoCarrito.ACTIVO);
        carritoActivo.setFechaCreacion(ahora);
        carritoActivo.setFechaActualizacion(ahora);
        carritoActivo.getItems().add(itemActivo);

        carritoRepository.save(carritoActivo);

        // ============================================================
        // RESUMEN PARA EL ORAL
        // ============================================================

        System.out.println();
        System.out.println("==============================================");
        System.out.println("       PRECARGA ORAL ZENOIR COMPLETADA");
        System.out.println("==============================================");

        System.out.println("ADMIN");
        System.out.println("  email: admin@zenoir.demo");
        System.out.println("  password: Admin123");
        System.out.println("  id: " + admin.getId());

        System.out.println();

        System.out.println("USER");
        System.out.println("  email: sofia@zenoir.demo");
        System.out.println("  password: Sofia123");
        System.out.println("  id: " + sofia.getId());

        System.out.println();

        System.out.println("USER LIMPIO");
        System.out.println("  email: lucas@zenoir.demo");
        System.out.println("  password: Lucas123");
        System.out.println("  id: " + lucas.getId());

        System.out.println();

        System.out.println("EVENTOS");
        System.out.println(
                "  " + electronicNight.getId()
                + " -> Zenoir Electronic Night");
        System.out.println(
                "  " + standUp.getId()
                + " -> Noche de Stand Up");
        System.out.println(
                "  " + galaZenoir.getId()
                + " -> Zenoir: Noche en el Palacio");

        System.out.println();

        System.out.println("EVENTO TIPO ENTRADA");
        System.out.println(
                "  " + eteGeneralElectronic.getId()
                + " -> Electronic / General");
        System.out.println(
                "  " + eteVipElectronic.getId()
                + " -> Electronic / VIP");
        System.out.println(
                "  " + eteMeetElectronic.getId()
                + " -> Electronic / Meet & Greet");
        System.out.println(
                "  " + eteGeneralStandUp.getId()
                + " -> StandUp / General");
        System.out.println(
                "  " + eteVipStandUp.getId()
                + " -> StandUp / VIP");
        System.out.println(
                "  " + eteGeneralGala.getId()
                + " -> Gala / General");
        System.out.println(
                "  " + eteVipGala.getId()
                + " -> Gala / VIP");
        System.out.println(
                "  " + eteMeetGalaAgotada.getId()
                + " -> Gala / Meet & Greet (AGOTADA)");

        System.out.println();

        System.out.println(
                "CARRITO CONVERTIDO: "
                + carritoConvertido.getId());

        System.out.println(
                "COMPRA CONFIRMADA: "
                + compra.getId());

        System.out.println(
                "CARRITO ACTIVO: "
                + carritoActivo.getId());

        System.out.println();

        System.out.println("QR disponibles:");
        System.out.println("  ORAL-QR-VIP-001");
        System.out.println("  ORAL-QR-VIP-002");

        System.out.println("==============================================");
        System.out.println();
    }

    private byte[] leerRecurso(String ruta) {
        try (var input = new ClassPathResource(ruta).getInputStream()) {
            return input.readAllBytes();
        } catch (java.io.IOException ex) {
            throw new IllegalStateException("No se pudo leer la imagen demo: " + ruta, ex);
        }
    }

    private ImagenEvento crearImagenEvento(
            Evento evento,
            String nombre,
            String tipoContenido,
            byte[] datos,
            TipoImagenEvento tipo,
            String descripcion,
            int orden) {

        ImagenEvento imagen = new ImagenEvento();
        imagen.setEvento(evento);
        imagen.setNombreArchivo(nombre);
        imagen.setTipoContenido(tipoContenido);
        imagen.setTamanio((long) datos.length);
        imagen.setDatos(datos);
        imagen.setTipoImagenEvento(tipo);
        imagen.setDescripcion(descripcion);
        imagen.setOrden(orden);
        return imagen;
    }

    private ImagenLocacion crearImagenLocacion(
            Locacion locacion,
            String nombre,
            String tipoContenido,
            byte[] datos,
            String textoAlternativo,
            int orden,
            LocalDateTime fechaCreacion) {

        ImagenLocacion imagen = new ImagenLocacion();
        imagen.setLocacion(locacion);
        imagen.setNombreArchivo(nombre);
        imagen.setTipoContenido(tipoContenido);
        imagen.setTamanio((long) datos.length);
        imagen.setDatos(datos);
        imagen.setTextoAlternativo(textoAlternativo);
        imagen.setOrden(orden);
        imagen.setFechaCreacion(fechaCreacion);
        return imagen;
    }

    private EventoTipoEntrada crearETE(
            Evento evento,
            TipoEntrada tipo,
            String precio,
            String descuento,
            int cantidad,
            LocalDateTime inicioVenta,
            LocalDateTime finVenta) {

        EventoTipoEntrada ete =
                new EventoTipoEntrada();

        ete.setEvento(evento);
        ete.setTipoEntrada(tipo);

        ete.setPrecio(new BigDecimal(precio));
        ete.setPorcentajeDescuento(
                new BigDecimal(descuento));

        ete.setCantidadTotal(cantidad);
        ete.setCantidadDisponible(cantidad);

        ete.setFechaInicioVenta(inicioVenta);
        ete.setFechaFinVenta(finVenta);

        ete.setEstado(
                EstadoEventoTipoEntrada.ACTIVO);

        return ete;
    }
}

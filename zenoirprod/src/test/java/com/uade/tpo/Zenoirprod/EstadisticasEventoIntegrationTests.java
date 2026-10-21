package com.uade.tpo.Zenoirprod;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.controllers.config.JwtService;
import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.Compra;
import com.uade.tpo.Zenoirprod.entity.Compra.EstadoCompra;
import com.uade.tpo.Zenoirprod.entity.DetalleCompra;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.Role;
import com.uade.tpo.Zenoirprod.entity.Ticket;
import com.uade.tpo.Zenoirprod.entity.Ticket.EstadoTicket;
import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;
import com.uade.tpo.Zenoirprod.repository.CompraRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

// Estadísticas de un evento para el resumen del admin: solo cuentan las compras confirmadas
@SpringBootTest
@ActiveProfiles("dev") // H2 en memoria, nunca la base real
@AutoConfigureMockMvc
@Transactional // cada test deshace lo que crea
class EstadisticasEventoIntegrationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private EventosRepository eventosRepository;
    @Autowired private TipoEntradaRepository tipoEntradaRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private CompraRepository compraRepository;

    private String tokenAdmin;
    private String tokenComprador;
    private Evento evento;
    private Evento eventoSinVentas;

    @BeforeEach
    void armarVentas() {
        tokenAdmin = jwtService.generateToken(crearUsuario("admin.estadisticas@zenoir.test", "91000001", Role.ADMIN));
        User comprador = crearUsuario("lucia.estadisticas@zenoir.test", "91000002", Role.USER);
        tokenComprador = jwtService.generateToken(comprador);

        Category categoria = new Category();
        categoria.setNombre("Categoria de estadisticas");
        categoria.setActivo(true);
        categoria = categoryRepository.save(categoria);
        Locacion locacion = new Locacion();
        locacion.setNombre("Salon de estadisticas");
        locacion.setDireccion("Calle 456");
        locacion = locationRepository.save(locacion);
        evento = crearEvento("Noche de estadisticas", locacion, categoria);
        eventoSinVentas = crearEvento("Noche sin ventas", locacion, categoria);

        EventoTipoEntrada general = crearOferta(evento, crearTipo("General estadisticas"), 100, 97);
        EventoTipoEntrada vip = crearOferta(evento, crearTipo("VIP estadisticas"), 50, 49);

        // Compra confirmada: 2 generales (una ya ingresó) y 1 VIP. Compra cancelada: 1 general que no tiene que contar
        guardarCompra(comprador, EstadoCompra.CONFIRMADA, List.of(
                detalle(general, 2, "36000.00", EstadoTicket.UTILIZADO, EstadoTicket.EMITIDO),
                detalle(vip, 1, "28000.00", EstadoTicket.EMITIDO)));
        guardarCompra(comprador, EstadoCompra.CANCELADA, List.of(detalle(general, 1, "18000.00", EstadoTicket.CANCELADO)));
    }

    @Test
    void resumeVentasRecaudadoComprasEIngresosDelEvento() throws Exception {
        mockMvc.perform(get("/eventos/" + evento.getId() + "/estadisticas").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vendidas").value(3))
                .andExpect(jsonPath("$.cupoTotal").value(150))
                .andExpect(jsonPath("$.recaudado").value(64000.0))
                .andExpect(jsonPath("$.compras").value(1))
                .andExpect(jsonPath("$.ingresados").value(1))
                .andExpect(jsonPath("$.porEntrada.length()").value(2))
                .andExpect(jsonPath("$.porEntrada[0].tipoEntradaNombre").value("General estadisticas"))
                .andExpect(jsonPath("$.porEntrada[0].vendidas").value(2))
                .andExpect(jsonPath("$.porEntrada[0].recaudado").value(36000.0))
                .andExpect(jsonPath("$.porEntrada[0].cupo").value(100))
                .andExpect(jsonPath("$.porEntrada[1].vendidas").value(1))
                .andExpect(jsonPath("$.porEntrada[1].recaudado").value(28000.0));
    }

    @Test
    void unEventoSinEntradasNiVentasDaTodoEnCero() throws Exception {
        mockMvc.perform(get("/eventos/" + eventoSinVentas.getId() + "/estadisticas").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vendidas").value(0))
                .andExpect(jsonPath("$.recaudado").value(0))
                .andExpect(jsonPath("$.porEntrada.length()").value(0));
    }

    @Test
    void unEventoQueNoExisteDevuelve404YSoloElAdminVeLasEstadisticas() throws Exception {
        mockMvc.perform(get("/eventos/999999/estadisticas").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/eventos/" + evento.getId() + "/estadisticas").header("Authorization", "Bearer " + tokenComprador))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/eventos/" + evento.getId() + "/estadisticas"))
                .andExpect(status().isUnauthorized());
    }

    private User crearUsuario(String email, String dni, Role rol) {
        return userRepository.save(User.builder().email(email).password("no-se-usa").firstName("Nombre").lastName("Apellido")
                .dni(dni).fechaNacimiento(LocalDate.of(1998, 5, 20)).role(rol).fechaRegistro(FechaCatalogo.ahora()).activo(true).build());
    }

    private Evento crearEvento(String titulo, Locacion locacion, Category categoria) {
        Evento nuevo = new Evento();
        nuevo.setTitulo(titulo);
        nuevo.setDescripcion("Descripcion");
        nuevo.setEstado("ACTIVO");
        nuevo.setLocacion(locacion);
        nuevo.setCategoria(categoria);
        nuevo.setFechaHoraInicio(FechaCatalogo.ahora().plusDays(1));
        nuevo.setFechaHoraFin(FechaCatalogo.ahora().plusDays(1).plusHours(5));
        return eventosRepository.save(nuevo);
    }

    private TipoEntrada crearTipo(String nombre) {
        TipoEntrada tipo = new TipoEntrada();
        tipo.setNombre(nombre);
        tipo.setDescripcionBase("Descripcion");
        tipo.setActivo(true);
        return tipoEntradaRepository.save(tipo);
    }

    private EventoTipoEntrada crearOferta(Evento delEvento, TipoEntrada tipo, int cupo, int disponibles) {
        EventoTipoEntrada oferta = new EventoTipoEntrada();
        oferta.setEvento(delEvento);
        oferta.setTipoEntrada(tipo);
        oferta.setPrecio(new BigDecimal("18000.00"));
        oferta.setPorcentajeDescuento(BigDecimal.ZERO);
        oferta.setCantidadTotal(cupo);
        oferta.setCantidadDisponible(disponibles);
        oferta.setFechaInicioVenta(FechaCatalogo.ahora().minusDays(5));
        oferta.setFechaFinVenta(FechaCatalogo.ahora().plusDays(1));
        oferta.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        return eventoTipoEntradaRepository.save(oferta);
    }

    private DetalleCompra detalle(EventoTipoEntrada oferta, int cantidad, String subtotal, EstadoTicket... estados) {
        List<Ticket> tickets = new ArrayList<>();
        for (EstadoTicket estado : estados) {
            Ticket ticket = new Ticket();
            ticket.setCodigoQr(java.util.UUID.randomUUID().toString());
            ticket.setEstado(estado);
            ticket.setFechaEmision(FechaCatalogo.ahora());
            tickets.add(ticket);
        }
        DetalleCompra detalle = new DetalleCompra();
        detalle.setEventoTipoEntrada(oferta);
        detalle.setCantidad(cantidad);
        detalle.setPrecioUnitario(new BigDecimal(subtotal).divide(BigDecimal.valueOf(cantidad)));
        detalle.setSubtotal(new BigDecimal(subtotal));
        detalle.setTickets(tickets);
        return detalle;
    }

    private void guardarCompra(User comprador, EstadoCompra estado, List<DetalleCompra> detalles) {
        Compra compra = new Compra();
        compra.setUsuario(comprador);
        compra.setEstado(estado);
        compra.setFechaCompra(FechaCatalogo.ahora());
        compra.setTotal(detalles.stream().map(DetalleCompra::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add));
        compra.setDetalles(new ArrayList<>(detalles));
        compraRepository.save(compra);
    }
}

package com.uade.tpo.Zenoirprod;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

// Reembolso de una compra (POST /compras/{id}/cancelar): solo si el evento fue cancelado o reprogramado y no se uso ninguna de
// sus entradas. Se hace sobre toda la compra: sus entradas quedan anuladas (ya no sirven en la puerta) y el stock vuelve a la oferta.
@SpringBootTest
@ActiveProfiles("dev") // siempre H2 en memoria: estas pruebas nunca tocan la base real
@AutoConfigureMockMvc
@Transactional // cada prueba deshace lo que creo
class ReembolsoCompraIntegrationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private EventosRepository eventosRepository;
    @Autowired private TipoEntradaRepository tipoEntradaRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;
    @Autowired private CompraRepository compraRepository;

    private String tokenComprador;
    private String tokenOtroUsuario;
    private Category categoria;
    private Locacion locacion;
    private TipoEntrada tipo;
    private User comprador;

    @BeforeEach
    void armarBase() {
        comprador = crearUsuario("comprador.reembolso@zenoir.test", "92000001");
        tokenComprador = jwtService.generateToken(comprador);
        tokenOtroUsuario = jwtService.generateToken(crearUsuario("otro.reembolso@zenoir.test", "92000002"));
        categoria = new Category();
        categoria.setNombre("Categoria de reembolsos");
        categoria.setActivo(true);
        categoria = categoryRepository.save(categoria);
        locacion = new Locacion();
        locacion.setNombre("Salon de reembolsos");
        locacion.setDireccion("Calle 789");
        locacion = locationRepository.save(locacion);
        tipo = new TipoEntrada();
        tipo.setNombre("General reembolsos");
        tipo.setDescripcionBase("Descripcion");
        tipo.setActivo(true);
        tipo = tipoEntradaRepository.save(tipo);
    }

    @Test
    void unEventoCanceladoPermiteReembolsarTodaLaCompraYDevuelveElStock() throws Exception {
        reembolsoPermitido("CANCELADO");
    }

    @Test
    void unEventoReprogramadoTambienPermiteReembolsar() throws Exception {
        reembolsoPermitido("REPROGRAMADO");
    }

    @Test
    void unEventoActivoNoPermiteReembolsarYNoCambiaNada() throws Exception {
        EventoTipoEntrada oferta = crearOferta(crearEvento("ACTIVO"), 100, 97);
        Compra compra = guardarCompra(oferta, 3);

        mockMvc.perform(post("/compras/" + compra.getId() + "/cancelar").header("Authorization", "Bearer " + tokenComprador))
                .andExpect(status().isConflict());

        assertEquals(EstadoCompra.CONFIRMADA, compraRepository.findById(compra.getId()).orElseThrow().getEstado());
        assertEquals(97, eventoTipoEntradaRepository.findById(oferta.getId()).orElseThrow().getCantidadDisponible());
    }

    @Test
    void otroUsuarioNoPuedeReembolsarUnaCompraAjenaYUnaCompraNoSeReembolsaDosVeces() throws Exception {
        EventoTipoEntrada oferta = crearOferta(crearEvento("CANCELADO"), 100, 97);
        Compra compra = guardarCompra(oferta, 3);

        mockMvc.perform(post("/compras/" + compra.getId() + "/cancelar").header("Authorization", "Bearer " + tokenOtroUsuario))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/compras/" + compra.getId() + "/cancelar").header("Authorization", "Bearer " + tokenComprador))
                .andExpect(status().isOk());
        mockMvc.perform(post("/compras/" + compra.getId() + "/cancelar").header("Authorization", "Bearer " + tokenComprador))
                .andExpect(status().isConflict());

        assertEquals(100, eventoTipoEntradaRepository.findById(oferta.getId()).orElseThrow().getCantidadDisponible());
    }

    @Test
    void unaCompraConUnaEntradaYaUsadaNoSePuedeReembolsarYNoCambiaNada() throws Exception {
        EventoTipoEntrada oferta = crearOferta(crearEvento("CANCELADO"), 100, 97);
        Compra compra = guardarCompra(oferta, 3, EstadoTicket.UTILIZADO);

        mockMvc.perform(post("/compras/" + compra.getId() + "/cancelar").header("Authorization", "Bearer " + tokenComprador))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("No hay reembolso: ya se uso una entrada de esta compra"));

        Compra guardada = compraRepository.findById(compra.getId()).orElseThrow();
        assertEquals(EstadoCompra.CONFIRMADA, guardada.getEstado());
        assertEquals(EstadoTicket.UTILIZADO, guardada.getDetalles().get(0).getTickets().get(0).getEstado());
        assertEquals(EstadoTicket.EMITIDO, guardada.getDetalles().get(0).getTickets().get(1).getEstado());
        assertEquals(97, eventoTipoEntradaRepository.findById(oferta.getId()).orElseThrow().getCantidadDisponible());
    }

    private void reembolsoPermitido(String estadoEvento) throws Exception {
        EventoTipoEntrada oferta = crearOferta(crearEvento(estadoEvento), 100, 97);
        Compra compra = guardarCompra(oferta, 3);

        mockMvc.perform(post("/compras/" + compra.getId() + "/cancelar").header("Authorization", "Bearer " + tokenComprador))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CANCELADA"))
                .andExpect(jsonPath("$.detalles[0].tickets.length()").value(3))
                .andExpect(jsonPath("$.detalles[0].tickets[0].estado").value("CANCELADO"))
                .andExpect(jsonPath("$.detalles[0].tickets[1].estado").value("CANCELADO"))
                .andExpect(jsonPath("$.detalles[0].tickets[2].estado").value("CANCELADO"));

        assertEquals(100, eventoTipoEntradaRepository.findById(oferta.getId()).orElseThrow().getCantidadDisponible());
    }

    private User crearUsuario(String email, String dni) {
        return userRepository.save(User.builder().email(email).password("no-se-usa").firstName("Nombre").lastName("Apellido")
                .dni(dni).fechaNacimiento(LocalDate.of(1998, 5, 20)).role(Role.USER).fechaRegistro(FechaCatalogo.ahora()).activo(true).build());
    }

    private Evento crearEvento(String estado) {
        Evento nuevo = new Evento();
        nuevo.setTitulo("Noche de reembolsos " + estado);
        nuevo.setDescripcion("Descripcion");
        nuevo.setEstado(estado);
        nuevo.setLocacion(locacion);
        nuevo.setCategoria(categoria);
        nuevo.setFechaHoraInicio(FechaCatalogo.ahora().plusDays(1));
        nuevo.setFechaHoraFin(FechaCatalogo.ahora().plusDays(1).plusHours(5));
        return eventosRepository.save(nuevo);
    }

    private EventoTipoEntrada crearOferta(Evento delEvento, int cupo, int disponibles) {
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

    // Una compra confirmada del comprador, con una entrada emitida por cada unidad.
    private Compra guardarCompra(EventoTipoEntrada oferta, int cantidad) {
        return guardarCompra(oferta, cantidad, EstadoTicket.EMITIDO);
    }

    // Igual, pero la primera entrada queda en el estado indicado (por ejemplo, ya usada).
    private Compra guardarCompra(EventoTipoEntrada oferta, int cantidad, EstadoTicket estadoDeLaPrimera) {
        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < cantidad; i++) {
            Ticket ticket = new Ticket();
            ticket.setCodigoQr(java.util.UUID.randomUUID().toString());
            ticket.setEstado(i == 0 ? estadoDeLaPrimera : EstadoTicket.EMITIDO);
            ticket.setFechaEmision(FechaCatalogo.ahora());
            tickets.add(ticket);
        }
        BigDecimal subtotal = new BigDecimal("18000.00").multiply(BigDecimal.valueOf(cantidad));
        DetalleCompra detalle = new DetalleCompra();
        detalle.setEventoTipoEntrada(oferta);
        detalle.setCantidad(cantidad);
        detalle.setPrecioUnitario(new BigDecimal("18000.00"));
        detalle.setSubtotal(subtotal);
        detalle.setTickets(tickets);
        Compra compra = new Compra();
        compra.setUsuario(comprador);
        compra.setEstado(EstadoCompra.CONFIRMADA);
        compra.setFechaCompra(FechaCatalogo.ahora());
        compra.setTotal(subtotal);
        compra.setDetalles(new ArrayList<>(List.of(detalle)));
        return compraRepository.save(compra);
    }
}

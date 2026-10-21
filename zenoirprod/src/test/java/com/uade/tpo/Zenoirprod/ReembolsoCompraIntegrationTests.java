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
import org.springframework.test.web.servlet.ResultActions;
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

// Reembolso de las entradas de UN evento de una compra (POST /compras/{id}/eventos/{eventoId}/reembolsar): solo si ese evento
// fue cancelado o reprogramado. Se reembolsan sus entradas emitidas (una ya usada no se reembolsa nunca): quedan anuladas (ya no
// sirven en la puerta) y el stock vuelve a la oferta. La compra pasa a CANCELADA solo cuando ninguna de sus entradas sigue vigente.
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
    void unEventoCanceladoPermiteReembolsarSusEntradasYDevuelveElStock() throws Exception {
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

        reembolsar(compra, oferta, tokenComprador).andExpect(status().isConflict());

        assertEquals(EstadoCompra.CONFIRMADA, compraRepository.findById(compra.getId()).orElseThrow().getEstado());
        assertEquals(97, eventoTipoEntradaRepository.findById(oferta.getId()).orElseThrow().getCantidadDisponible());
    }

    @Test
    void otroUsuarioNoPuedeReembolsarUnaCompraAjenaYLasEntradasNoSeReembolsanDosVeces() throws Exception {
        EventoTipoEntrada oferta = crearOferta(crearEvento("CANCELADO"), 100, 97);
        Compra compra = guardarCompra(oferta, 3);

        reembolsar(compra, oferta, tokenOtroUsuario).andExpect(status().isForbidden());
        reembolsar(compra, oferta, tokenComprador).andExpect(status().isOk());
        reembolsar(compra, oferta, tokenComprador).andExpect(status().isConflict());

        assertEquals(100, eventoTipoEntradaRepository.findById(oferta.getId()).orElseThrow().getCantidadDisponible());
    }

    @Test
    void unaEntradaYaUsadaNoSeReembolsaPeroLasDemasSiYLaCompraSigueConfirmada() throws Exception {
        EventoTipoEntrada oferta = crearOferta(crearEvento("CANCELADO"), 100, 97);
        Compra compra = guardarCompra(oferta, 3, EstadoTicket.UTILIZADO);

        reembolsar(compra, oferta, tokenComprador)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CONFIRMADA"))
                .andExpect(jsonPath("$.detalles[0].tickets[0].estado").value("UTILIZADO"))
                .andExpect(jsonPath("$.detalles[0].tickets[1].estado").value("CANCELADO"))
                .andExpect(jsonPath("$.detalles[0].tickets[2].estado").value("CANCELADO"));

        assertEquals(99, eventoTipoEntradaRepository.findById(oferta.getId()).orElseThrow().getCantidadDisponible());
        // Las dos ya estan reembolsadas y la otra esta usada: no queda nada para reembolsar.
        reembolsar(compra, oferta, tokenComprador).andExpect(status().isConflict());
    }

    @Test
    void siTodasLasEntradasDelEventoYaSeUsaronNoHayNadaParaReembolsar() throws Exception {
        EventoTipoEntrada oferta = crearOferta(crearEvento("CANCELADO"), 100, 99);
        Compra compra = guardarCompra(oferta, 1, EstadoTicket.UTILIZADO);

        reembolsar(compra, oferta, tokenComprador).andExpect(status().isConflict());

        assertEquals(EstadoCompra.CONFIRMADA, compraRepository.findById(compra.getId()).orElseThrow().getEstado());
        assertEquals(99, eventoTipoEntradaRepository.findById(oferta.getId()).orElseThrow().getCantidadDisponible());
    }

    @Test
    void enUnaCompraConVariosEventosSeReembolsaSoloElEventoCanceladoYLosDemasQuedanIntactos() throws Exception {
        EventoTipoEntrada cancelada = crearOferta(crearEvento("CANCELADO"), 100, 97);
        EventoTipoEntrada activa = crearOferta(crearEvento("ACTIVO"), 100, 98);
        Compra compra = guardarCompraMixta(cancelada, 3, activa, 2);

        reembolsar(compra, cancelada, tokenComprador)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CONFIRMADA"))
                .andExpect(jsonPath("$.detalles[0].tickets[0].estado").value("CANCELADO"))
                .andExpect(jsonPath("$.detalles[1].tickets[0].estado").value("EMITIDO"))
                .andExpect(jsonPath("$.detalles[1].tickets[1].estado").value("EMITIDO"));

        assertEquals(100, eventoTipoEntradaRepository.findById(cancelada.getId()).orElseThrow().getCantidadDisponible());
        assertEquals(98, eventoTipoEntradaRepository.findById(activa.getId()).orElseThrow().getCantidadDisponible());
        // El evento que sigue en pie no se puede reembolsar.
        reembolsar(compra, activa, tokenComprador).andExpect(status().isConflict());
    }

    @Test
    void siSeReembolsanTodosLosEventosDeLaCompraEstaPasaACancelada() throws Exception {
        EventoTipoEntrada una = crearOferta(crearEvento("CANCELADO"), 100, 97);
        EventoTipoEntrada otra = crearOferta(crearEvento("REPROGRAMADO"), 100, 98);
        Compra compra = guardarCompraMixta(una, 3, otra, 2);

        reembolsar(compra, una, tokenComprador).andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("CONFIRMADA"));
        reembolsar(compra, otra, tokenComprador).andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("CANCELADA"));
    }

    @Test
    void unEventoQueNoEstaEnLaCompraNoSePuedeReembolsar() throws Exception {
        EventoTipoEntrada propia = crearOferta(crearEvento("CANCELADO"), 100, 97);
        EventoTipoEntrada ajena = crearOferta(crearEvento("CANCELADO"), 100, 97);
        Compra compra = guardarCompra(propia, 3);

        reembolsar(compra, ajena, tokenComprador).andExpect(status().isConflict());
        assertEquals(97, eventoTipoEntradaRepository.findById(propia.getId()).orElseThrow().getCantidadDisponible());
    }

    private ResultActions reembolsar(Compra compra, EventoTipoEntrada oferta, String token) throws Exception {
        return mockMvc.perform(post("/compras/" + compra.getId() + "/eventos/" + oferta.getEvento().getId() + "/reembolsar")
                .header("Authorization", "Bearer " + token));
    }

    private void reembolsoPermitido(String estadoEvento) throws Exception {
        EventoTipoEntrada oferta = crearOferta(crearEvento(estadoEvento), 100, 97);
        Compra compra = guardarCompra(oferta, 3);

        reembolsar(compra, oferta, tokenComprador)
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
        return guardar(List.of(detalle(oferta, cantidad, estadoDeLaPrimera)));
    }

    // Una compra con entradas de dos eventos distintos (dos detalles).
    private Compra guardarCompraMixta(EventoTipoEntrada una, int cantidadUna, EventoTipoEntrada otra, int cantidadOtra) {
        return guardar(List.of(detalle(una, cantidadUna, EstadoTicket.EMITIDO), detalle(otra, cantidadOtra, EstadoTicket.EMITIDO)));
    }

    private DetalleCompra detalle(EventoTipoEntrada oferta, int cantidad, EstadoTicket estadoDeLaPrimera) {
        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < cantidad; i++) {
            Ticket ticket = new Ticket();
            ticket.setCodigoQr(java.util.UUID.randomUUID().toString());
            ticket.setEstado(i == 0 ? estadoDeLaPrimera : EstadoTicket.EMITIDO);
            ticket.setFechaEmision(FechaCatalogo.ahora());
            tickets.add(ticket);
        }
        DetalleCompra detalle = new DetalleCompra();
        detalle.setEventoTipoEntrada(oferta);
        detalle.setCantidad(cantidad);
        detalle.setPrecioUnitario(new BigDecimal("18000.00"));
        detalle.setSubtotal(new BigDecimal("18000.00").multiply(BigDecimal.valueOf(cantidad)));
        detalle.setTickets(tickets);
        return detalle;
    }

    private Compra guardar(List<DetalleCompra> detalles) {
        Compra compra = new Compra();
        compra.setUsuario(comprador);
        compra.setEstado(EstadoCompra.CONFIRMADA);
        compra.setFechaCompra(FechaCatalogo.ahora());
        compra.setTotal(detalles.stream().map(DetalleCompra::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add));
        compra.setDetalles(new ArrayList<>(detalles));
        return compraRepository.save(compra);
    }
}

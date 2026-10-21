package com.uade.tpo.Zenoirprod;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.Zenoirprod.controllers.config.JwtService;
import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.EventoTipoEntrada.EstadoEventoTipoEntrada;
import com.uade.tpo.Zenoirprod.entity.Locacion;
import com.uade.tpo.Zenoirprod.entity.Role;
import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.entity.User;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.UserRepository;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;

// Validaciones de datos y visibilidad: el registro dice que dato esta mal, los textos demasiado largos dan 400 (y no 500),
// los borradores solo los ve un administrador, la venta no puede terminar despues del evento y las imagenes se revisan.
@SpringBootTest
@ActiveProfiles("dev") // siempre H2 en memoria: estas pruebas nunca tocan la base real
@AutoConfigureMockMvc
@Transactional // cada prueba deshace lo que creo
class ValidacionesIntegrationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private EventosRepository eventosRepository;
    @Autowired private TipoEntradaRepository tipoEntradaRepository;
    @Autowired private EventoTipoEntradaRepository eventoTipoEntradaRepository;

    private String tokenAdmin;
    private String tokenUsuario;
    private Category categoria;
    private Locacion locacion;
    private TipoEntrada tipo;

    @BeforeEach
    void armarBase() {
        tokenAdmin = jwtService.generateToken(crearUsuario("admin.validaciones@zenoir.test", "93000001", Role.ADMIN));
        tokenUsuario = jwtService.generateToken(crearUsuario("usuario.validaciones@zenoir.test", "93000002", Role.USER));
        categoria = new Category();
        categoria.setNombre("Categoria de validaciones");
        categoria.setActivo(true);
        categoria = categoryRepository.save(categoria);
        locacion = new Locacion();
        locacion.setNombre("Salon de validaciones");
        locacion.setDireccion("Calle 1");
        locacion = locationRepository.save(locacion);
        tipo = new TipoEntrada();
        tipo.setNombre("General validaciones");
        tipo.setDescripcionBase("Descripcion");
        tipo.setActivo(true);
        tipo = tipoEntradaRepository.save(tipo);
    }

    // --- registro ---

    private Map<String, Object> registroValido() {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("firstname", "Lucia");
        cuerpo.put("lastname", "Perez");
        cuerpo.put("dni", "40123456");
        cuerpo.put("fechaNacimiento", LocalDate.now().minusYears(30).toString());
        cuerpo.put("email", "lucia.valida@zenoir.test");
        cuerpo.put("password", "Clave123!");
        return cuerpo;
    }

    private void registroRechazado(String campo, Object valor, String queDice) throws Exception {
        Map<String, Object> cuerpo = registroValido();
        cuerpo.put(campo, valor);
        mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cuerpo)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString(queDice)));
    }

    @Test
    void elRegistroValidoSeAcepta() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registroValido())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void elRegistroDiceQueDatoEstaMal() throws Exception {
        registroRechazado("dni", "abc", "DNI");
        registroRechazado("dni", "1234567890123456789012345678", "DNI");
        registroRechazado("dni", "12.345.678", "DNI");
        registroRechazado("fechaNacimiento", LocalDate.now().minusYears(10).toString(), "mayor de 18");
        registroRechazado("fechaNacimiento", "1800-01-01", "fecha de nacimiento");
        registroRechazado("fechaNacimiento", LocalDate.now().plusDays(1).toString(), "fecha de nacimiento");
        registroRechazado("email", "no-es-un-mail", "email");
        registroRechazado("email", "a".repeat(300) + "@zenoir.test", "email");
        registroRechazado("firstname", "   ", "nombre");
        registroRechazado("firstname", "n".repeat(400), "nombre");
        registroRechazado("lastname", "l".repeat(400), "apellido");
    }

    @Test
    void laContrasenaPideLoMismoQueElFormulario() throws Exception {
        for (String clave : new String[] {"x", "1", "12345", "clave123!", "CLAVE123!", "Clavecita!", "Clave1234", "Aa1!", "Aa1!" + "x".repeat(70)}) {
            registroRechazado("password", clave, "contrasena");
        }
    }

    // --- textos largos: 400 con mensaje, no 500 ---

    @Test
    void unTextoMasLargoQueLaBaseDaUn400() throws Exception {
        Map<String, Object> evento = new LinkedHashMap<>();
        evento.put("titulo", "t".repeat(400));
        evento.put("descripcion", "d");
        evento.put("estado", "ACTIVO");
        evento.put("locacion_id", locacion.getId());
        evento.put("categoria_id", categoria.getId());
        evento.put("fechaHoraInicio", FechaCatalogo.ahora().plusDays(30).toString());
        evento.put("fechaHoraFin", FechaCatalogo.ahora().plusDays(30).plusHours(5).toString());
        mockMvc.perform(post("/eventos").header("Authorization", "Bearer " + tokenAdmin).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evento)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message", containsString("titulo")));
        mockMvc.perform(post("/locaciones").header("Authorization", "Bearer " + tokenAdmin).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nombre", "n".repeat(400), "direccion", "d"))))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message", containsString("nombre")));
        mockMvc.perform(post("/tiposEntrada").header("Authorization", "Bearer " + tokenAdmin).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nombre", "n".repeat(400), "descripcionBase", "d", "activo", true))))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message", containsString("nombre")));
        mockMvc.perform(post("/categories").header("Authorization", "Bearer " + tokenAdmin).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nombre", "n".repeat(300), "activo", true))))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message", containsString("nombre")));
    }

    // --- borradores ---

    @Test
    void unBorradorSoloLoVeUnAdministrador() throws Exception {
        Evento borrador = crearEvento("Borrador secreto", "BORRADOR", 30);
        EventoTipoEntrada oferta = crearOferta(borrador, 10);

        mockMvc.perform(get("/eventos/" + borrador.getId())).andExpect(status().isNotFound());
        mockMvc.perform(get("/eventos/" + borrador.getId()).header("Authorization", "Bearer " + tokenUsuario)).andExpect(status().isNotFound());
        mockMvc.perform(get("/eventos/" + borrador.getId()).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.titulo").value("Borrador secreto"));

        // El listado sin catalogo=true lo traia: ahora a un visitante o usuario nunca le llega un borrador.
        mockMvc.perform(get("/eventos?page=0&size=100"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[*].titulo", not(hasItem("Borrador secreto"))));
        mockMvc.perform(get("/eventos?page=0&size=100").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[*].titulo", hasItem("Borrador secreto")));

        mockMvc.perform(get("/eventosTiposEntrada/evento/" + borrador.getId())).andExpect(status().isNotFound());
        mockMvc.perform(get("/eventosTiposEntrada/evento/" + borrador.getId()).header("Authorization", "Bearer " + tokenAdmin)).andExpect(status().isOk());
        mockMvc.perform(get("/eventosTiposEntrada/" + oferta.getId())).andExpect(status().isNotFound());
        mockMvc.perform(get("/eventos/" + borrador.getId() + "/imagenes")).andExpect(status().isNotFound());
        mockMvc.perform(get("/eventos/" + borrador.getId() + "/imagenes").header("Authorization", "Bearer " + tokenAdmin)).andExpect(status().isOk());
    }

    @Test
    void unEventoPublicadoSigueSiendoPublico() throws Exception {
        Evento activo = crearEvento("Evento publicado", "ACTIVO", 30);
        crearOferta(activo, 10);
        mockMvc.perform(get("/eventos/" + activo.getId())).andExpect(status().isOk());
        mockMvc.perform(get("/eventosTiposEntrada/evento/" + activo.getId())).andExpect(status().isOk());
        mockMvc.perform(get("/eventos/" + activo.getId() + "/imagenes")).andExpect(status().isOk());
    }

    // --- ventas ---

    @Test
    void laVentaDeUnaEntradaNoPuedeTerminarDespuesDelEvento() throws Exception {
        Evento evento = crearEvento("Evento con venta", "ACTIVO", 30);
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("eventoId", evento.getId());
        cuerpo.put("tipoEntradaId", tipo.getId());
        cuerpo.put("precio", 1000);
        cuerpo.put("porcentajeDescuento", 0);
        cuerpo.put("cantidadTotal", 10);
        cuerpo.put("fechaInicioVenta", FechaCatalogo.ahora().minusDays(1).toString());
        cuerpo.put("fechaFinVenta", evento.getFechaHoraFin().plusDays(1).toString());
        cuerpo.put("estado", "ACTIVO");
        mockMvc.perform(post("/eventosTiposEntrada").header("Authorization", "Bearer " + tokenAdmin).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cuerpo)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message", containsString("fin del evento")));

        cuerpo.put("fechaFinVenta", evento.getFechaHoraFin().toString());
        mockMvc.perform(post("/eventosTiposEntrada").header("Authorization", "Bearer " + tokenAdmin).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cuerpo)))
                .andExpect(status().isCreated());
    }

    @Test
    void unaEntradaNoSePuedeEditarParaQueLaVentaTermineDespuesDelEvento() throws Exception {
        Evento evento = crearEvento("Evento a editar", "ACTIVO", 30);
        EventoTipoEntrada oferta = crearOferta(evento, 10);
        mockMvc.perform(patch("/eventosTiposEntrada/" + oferta.getId()).header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("fechaFinVenta", evento.getFechaHoraFin().plusHours(1).toString()))))
                .andExpect(status().isBadRequest());
        mockMvc.perform(patch("/eventosTiposEntrada/" + oferta.getId()).header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("fechaFinVenta", evento.getFechaHoraFin().toString()))))
                .andExpect(status().isOk());
    }

    @Test
    void unEventoTerminadoNoTieneDisponibilidadAunqueSigaActivo() throws Exception {
        Evento terminado = new Evento();
        terminado.setTitulo("Evento terminado");
        terminado.setDescripcion("d");
        terminado.setEstado("ACTIVO");
        terminado.setLocacion(locacion);
        terminado.setCategoria(categoria);
        terminado.setFechaHoraInicio(FechaCatalogo.ahora().minusDays(2));
        terminado.setFechaHoraFin(FechaCatalogo.ahora().minusDays(1));
        terminado = eventosRepository.save(terminado);
        EventoTipoEntrada oferta = crearOferta(terminado, 10);

        mockMvc.perform(get("/eventosTiposEntrada/" + oferta.getId() + "/disponibilidad?cantidad=1"))
                .andExpect(status().isOk()).andExpect(content().string("false"));
    }

    @Test
    void unaCantidadConDecimalesSeRechazaEnLugarDeTruncarse() throws Exception {
        Evento evento = crearEvento("Evento carrito", "ACTIVO", 30);
        EventoTipoEntrada oferta = crearOferta(evento, 10);
        mockMvc.perform(post("/carritos/activo/items").header("Authorization", "Bearer " + tokenUsuario).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"eventoTipoEntradaId\": " + oferta.getId() + ", \"cantidad\": 1.5}"))
                .andExpect(status().isBadRequest());
    }

    // --- imagenes ---

    private MockMultipartFile archivo(String tipoContenido, byte[] datos) {
        return new MockMultipartFile("archivo", "foto.png", tipoContenido, datos);
    }

    @Test
    void soloSeAceptanImagenesDeVerdad() throws Exception {
        Evento evento = crearEvento("Evento con fotos", "ACTIVO", 30);
        byte[] png = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

        // Dice ser PNG pero son letras: se rechaza.
        mockMvc.perform(multipart("/eventos/" + evento.getId() + "/imagenes").file(archivo("image/png", "esto no es un png".getBytes()))
                        .param("tipoImagenEvento", "GALERIA").param("orden", "1").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message", containsString("imagen")));
        // Un tipo que no es de los permitidos: se rechaza.
        mockMvc.perform(multipart("/eventos/" + evento.getId() + "/imagenes").file(archivo("image/svg+xml", png))
                        .param("tipoImagenEvento", "GALERIA").param("orden", "1").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isBadRequest());
        // Una imagen de verdad: se acepta.
        mockMvc.perform(multipart("/eventos/" + evento.getId() + "/imagenes").file(archivo("image/png", png))
                        .param("tipoImagenEvento", "GALERIA").param("orden", "1").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isCreated());
    }

    // --- ayudas ---

    private User crearUsuario(String email, String dni, Role rol) {
        return userRepository.save(User.builder().email(email).password("no-se-usa").firstName("Nombre").lastName("Apellido")
                .dni(dni).fechaNacimiento(LocalDate.of(1998, 5, 20)).role(rol).fechaRegistro(FechaCatalogo.ahora()).activo(true).build());
    }

    private Evento crearEvento(String titulo, String estado, int diasAdelante) {
        Evento nuevo = new Evento();
        nuevo.setTitulo(titulo);
        nuevo.setDescripcion("Descripcion");
        nuevo.setEstado(estado);
        nuevo.setLocacion(locacion);
        nuevo.setCategoria(categoria);
        nuevo.setFechaHoraInicio(FechaCatalogo.ahora().plusDays(diasAdelante));
        nuevo.setFechaHoraFin(FechaCatalogo.ahora().plusDays(diasAdelante).plusHours(5));
        return eventosRepository.save(nuevo);
    }

    private EventoTipoEntrada crearOferta(Evento delEvento, int cupo) {
        EventoTipoEntrada oferta = new EventoTipoEntrada();
        oferta.setEvento(delEvento);
        oferta.setTipoEntrada(tipo);
        oferta.setPrecio(new BigDecimal("18000.00"));
        oferta.setPorcentajeDescuento(BigDecimal.ZERO);
        oferta.setCantidadTotal(cupo);
        oferta.setCantidadDisponible(cupo);
        LocalDateTime fin = delEvento.getFechaHoraFin();
        oferta.setFechaInicioVenta(FechaCatalogo.ahora().minusDays(5));
        oferta.setFechaFinVenta(fin);
        oferta.setEstado(EstadoEventoTipoEntrada.ACTIVO);
        return eventoTipoEntradaRepository.save(oferta);
    }
}

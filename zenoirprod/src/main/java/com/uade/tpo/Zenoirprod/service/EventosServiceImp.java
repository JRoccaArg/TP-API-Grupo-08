package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import com.uade.tpo.Zenoirprod.util.FechaCatalogo;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.EventoEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.EventoInvalidoException;
import com.uade.tpo.Zenoirprod.exceptions.FechaEventoInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TituloEventoEnUsoException;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.EventoTipoEntradaRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;

@Service
public class EventosServiceImp implements EventosService {
    private static final Set<String> ESTADOS_VALIDOS = Set.of(
            "BORRADOR", "ACTIVO", "FINALIZADO", "CANCELADO", "REPROGRAMADO");

    
    @Autowired
    private EventosRepository eventosRepository;
    @Autowired
    private LocationRepository locacionRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private EventoTipoEntradaRepository eventoTipoEntradaRepository;


    public Page<Evento> getEventos(PageRequest pageRequest) {
        return eventosRepository.findAll(pageRequest);
    }


    // La llamada histórica conserva sus resultados, estados y paginación.
    public Page<Evento> getEventos(PageRequest pageRequest, String nombre, Integer categoriaId,
            BigDecimal precioMin, BigDecimal precioMax, boolean catalogo, boolean proximo, boolean antiguosPrimero)
            throws EventoInvalidoException {
        if ((precioMin != null && precioMin.signum() < 0)
                || (precioMax != null && precioMax.signum() < 0)
                || (precioMin != null && precioMax != null && precioMin.compareTo(precioMax) > 0)
                || (categoriaId != null && categoriaId < 1)) {
            throw new EventoInvalidoException();
        }
        String busqueda = nombre == null ? "" : Normalizer.normalize(nombre.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        if (busqueda.isEmpty() && categoriaId == null && precioMin == null && precioMax == null
                && !catalogo && !proximo) {
            return getEventos(pageRequest);
        }
        // Los caracteres de LIKE se buscan literalmente, igual que en el filtro anterior.
        String patron = "%" + busqueda.replace("!", "!!").replace("%", "!%").replace("_", "!_").replace("[", "![") + "%";
        return eventosRepository.buscar(patron, categoriaId, precioMin, precioMax,
                catalogo, proximo, antiguosPrimero, FechaCatalogo.ahora(), pageRequest);
    }

    @Transactional
    public int finalizarVencidos() {
        return eventosRepository.finalizarVencidos(FechaCatalogo.ahora());
    }

    public Optional<Evento> getEventoPorId(Integer id) throws EventoInexistenteException {
        return Optional.of(eventosRepository.findById(id)
                .orElseThrow(EventoInexistenteException::new));
    }



    public void deleteEvento(Integer id) throws EventoInexistenteException, EventoEnUsoException {
        if (!eventosRepository.existsById(id)) {
            throw new EventoInexistenteException();
        }
        if (eventoTipoEntradaRepository.existsByEvento_Id(id)) {
            throw new EventoEnUsoException();
        }
        eventosRepository.deleteById(id);
    }

    public Evento crearEvento(String titulo, String descripcion, String estado, Integer locacion_id, Integer categoria_id,
            LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
            throws LocacionInexsistenteException, TituloEventoEnUsoException,
            FechaEventoInvalidaException, EventoInvalidoException, CategoryInexistenteException {
        validarDatosEvento(titulo, estado, locacion_id, categoria_id);
        if (!locacionRepository.existsById(locacion_id)) {
            throw new LocacionInexsistenteException();
        }
        if (!categoryRepository.existsById(categoria_id)) {
            throw new CategoryInexistenteException();
        }
        if (eventosRepository.existsByTitulo(titulo)) {
            throw new TituloEventoEnUsoException();
        }
        validarFechas(fechaHoraInicio, fechaHoraFin, true);

        Evento evento = new Evento();
        evento.setTitulo(titulo);
        evento.setDescripcion(descripcion);
        evento.setEstado(estado);
        evento.setLocacion(locacionRepository.findById(locacion_id).get());
        evento.setCategoria(categoryRepository.findById(categoria_id).get());
        evento.setFechaHoraInicio(fechaHoraInicio);
        evento.setFechaHoraFin(fechaHoraFin);
        return eventosRepository.save(evento);
    }

    public Evento updateEvento(Integer id, String titulo, String descripcion, String estado, Integer locacion_id, Integer categoria_id,
            LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin)
            throws EventoInexistenteException, LocacionInexsistenteException,
            TituloEventoEnUsoException, FechaEventoInvalidaException,
            EventoInvalidoException, CategoryInexistenteException {
        // Validaciones Previas a Updatear
        if (!eventosRepository.existsById(id)) {
            throw new EventoInexistenteException();
        }
        if (titulo != null && titulo.isBlank()) {
            throw new EventoInvalidoException();
        }
        if (estado != null && !ESTADOS_VALIDOS.contains(estado)) {
            throw new EventoInvalidoException();
        }
        if (titulo != null && eventosRepository.existsByTituloAndIdNot(titulo, id)) {
            throw new TituloEventoEnUsoException();
        }
        if (locacion_id != null && !locacionRepository.existsById(locacion_id)) {
            throw new LocacionInexsistenteException();
        }
        if (categoria_id != null && !categoryRepository.existsById(categoria_id)) {
            throw new CategoryInexistenteException();
        }

        Evento ev = eventosRepository.findById(id).get();
        boolean huboCambios = false;

        if (fechaHoraInicio != null || fechaHoraFin != null) {
            LocalDateTime inicioFinal = fechaHoraInicio != null ? fechaHoraInicio : ev.getFechaHoraInicio();
            LocalDateTime finFinal = fechaHoraFin != null ? fechaHoraFin : ev.getFechaHoraFin();
            validarFechas(inicioFinal, finFinal, fechaHoraInicio != null);
        }

        // Update del Evento
        if (titulo != null) {
            ev.setTitulo(titulo);
            huboCambios = true;
        }
        if (descripcion != null) {
            ev.setDescripcion(descripcion);
            huboCambios = true;
        }
        if (estado != null) {
            ev.setEstado(estado);
            huboCambios = true;
        }
        if (locacion_id != null) {
            ev.setLocacion(locacionRepository.findById(locacion_id).get());
            huboCambios = true;
        }
        if (categoria_id != null) {
            ev.setCategoria(categoryRepository.findById(categoria_id).get());
            huboCambios = true;
        }
        if (fechaHoraInicio != null) {
            ev.setFechaHoraInicio(fechaHoraInicio);
            huboCambios = true;
        }
        if (fechaHoraFin != null) {
            ev.setFechaHoraFin(fechaHoraFin);
            huboCambios = true;
        }
        
        // Guardo si hubo cambios, sino devuelvo el evento original
        if (huboCambios) {
            return eventosRepository.save(ev);
        } else {
            return eventosRepository.findById(id).get();
        }
    }

    private void validarFechas(LocalDateTime fechaHoraInicio, LocalDateTime fechaHoraFin,
            boolean validarInicioFuturo) throws FechaEventoInvalidaException {
        if (fechaHoraInicio == null || fechaHoraFin == null
                || !fechaHoraFin.isAfter(fechaHoraInicio)
                || (validarInicioFuturo && fechaHoraInicio.isBefore(FechaCatalogo.ahora()))) {
            throw new FechaEventoInvalidaException();
        }
    }

    private void validarDatosEvento(String titulo, String estado, Integer locacionId, Integer categoriaId)
            throws EventoInvalidoException {
        if (titulo == null || titulo.isBlank()
                || estado == null || !ESTADOS_VALIDOS.contains(estado)
                || locacionId == null || categoriaId == null) {
            throw new EventoInvalidoException();
        }
    }
}

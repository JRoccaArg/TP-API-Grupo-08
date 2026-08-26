package com.uade.tpo.Zenoirprod.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.entity.Evento;
import com.uade.tpo.Zenoirprod.exceptions.EventoInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.LocacionInexsistenteException;
import com.uade.tpo.Zenoirprod.exceptions.TituloEventoEnUsoException;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;
import com.uade.tpo.Zenoirprod.repository.LocationRepository;

@Service
public class EventosServiceImp implements EventosService {
    
    @Autowired
    private EventosRepository eventosRepository;
    @Autowired
    private LocationRepository locacionRepository;


    public Page<Evento> getEventos(PageRequest pageRequest) {
        return eventosRepository.findAll(pageRequest);
    }


    public Optional<Evento> getEventoPorId(Integer id) throws EventoInexistenteException {
        if (!eventosRepository.existsById(id)) {
            throw new EventoInexistenteException();
        }
        return eventosRepository.findById(id);
    }



    public void deleteEvento(Integer id) throws EventoInexistenteException {
        if (!eventosRepository.existsById(id)) {
            throw new EventoInexistenteException();
        }
        eventosRepository.deleteById(id);
    }

    public Evento crearEvento(String titulo, String descripcion, String estado, Integer locacion_id, LocalDateTime fecha_hora) throws LocacionInexsistenteException, TituloEventoEnUsoException {
        if (!locacionRepository.existsById(locacion_id)) {
            throw new LocacionInexsistenteException();
        }
        if (eventosRepository.findAll().stream().anyMatch(evento -> evento.getTitulo().equals(titulo))) {
            throw new TituloEventoEnUsoException();
        }
        // Insertar acá validación de fecha_hora 
        Evento evento = new Evento();
        evento.setTitulo(titulo);
        evento.setDescripcion(descripcion);
        evento.setEstado(estado);
        evento.setLocacion(locacionRepository.findById(locacion_id).get());
        evento.setFecha_hora(fecha_hora);
        return eventosRepository.save(evento);
    }
}

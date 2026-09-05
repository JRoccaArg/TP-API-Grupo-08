package com.uade.tpo.Zenoirprod.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.entity.TipoEntrada;
import com.uade.tpo.Zenoirprod.exceptions.TipoEntradaInexistenteException;
import com.uade.tpo.Zenoirprod.repository.TipoEntradaRepository;

@Service
public class TipoEntradaServiceImp implements TipoEntradaService {

    @Autowired
    private TipoEntradaRepository tipoEntradaRepository;

    public Page<TipoEntrada> getTiposEntrada(PageRequest pageRequest) {
        return tipoEntradaRepository.findAll(pageRequest);
    }

    public TipoEntrada getTipoEntradaPorId(Integer id) throws TipoEntradaInexistenteException {
        return tipoEntradaRepository.findById(id)
                .orElseThrow(TipoEntradaInexistenteException::new);
    }

    public TipoEntrada crearTipoEntrada(String nombre, String descripcionBase, Boolean activo) {
        TipoEntrada tipoEntrada = new TipoEntrada();
        tipoEntrada.setNombre(nombre);
        tipoEntrada.setDescripcionBase(descripcionBase);
        /* Si no mandan activo, queda en true (tipo habilitado) */
        tipoEntrada.setActivo(activo != null ? activo : true);
        return tipoEntradaRepository.save(tipoEntrada);
    }

    public TipoEntrada updateTipoEntrada(Integer id, String nombre, String descripcionBase, Boolean activo)
            throws TipoEntradaInexistenteException {
        TipoEntrada tipoEntrada = getTipoEntradaPorId(id);
        tipoEntrada.setNombre(nombre);
        tipoEntrada.setDescripcionBase(descripcionBase);
        tipoEntrada.setActivo(activo != null ? activo : tipoEntrada.getActivo());
        return tipoEntradaRepository.save(tipoEntrada);
    }

    public void deleteTipoEntrada(Integer id) throws TipoEntradaInexistenteException {
        if (!tipoEntradaRepository.existsById(id)) {
            throw new TipoEntradaInexistenteException();
        }
        tipoEntradaRepository.deleteById(id);
    }
}

package com.uade.tpo.Zenoirprod.entity.dto;

import com.uade.tpo.Zenoirprod.entity.TipoImagenEvento;

import lombok.Data;

@Data
public class ImagenEventoRequest {
    private String url;
    private String descripcion;
    private Integer eventoId;
    private TipoImagenEvento tipoImagenEvento;
    private Integer orden;
}

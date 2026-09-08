package com.uade.tpo.Zenoirprod.util;

import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;

public final class PageableFactory {

    public static final int SIZE_MAXIMO = 100;

    private PageableFactory() {
    }

    public static PageRequest crear(Integer page, Integer size) throws PaginacionInvalidaException {
        if (page == null && size == null) {
            return PageRequest.of(0, Integer.MAX_VALUE);
        }
        if (page == null || size == null) {
            throw new PaginacionInvalidaException("Se deben enviar page y size juntos, o ninguno.");
        }
        if (page < 0) {
            throw new PaginacionInvalidaException("page debe ser mayor o igual a 0.");
        }
        if (size < 1) {
            throw new PaginacionInvalidaException("size debe ser mayor o igual a 1.");
        }
        if (size > SIZE_MAXIMO) {
            throw new PaginacionInvalidaException("size no puede superar " + SIZE_MAXIMO + ".");
        }
        return PageRequest.of(page, size);
    }
}

package com.uade.tpo.Zenoirprod.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;

class PageableFactoryTest {

    @Test
    void ambosNullDevuelvePaginaUnicaConTodos() throws Exception {
        PageRequest p = PageableFactory.crear(null, null);
        assertEquals(0, p.getPageNumber());
        assertEquals(Integer.MAX_VALUE, p.getPageSize());
    }

    @Test
    void valoresValidosDevuelvenPageRequest() throws Exception {
        PageRequest p = PageableFactory.crear(2, 20);
        assertEquals(2, p.getPageNumber());
        assertEquals(20, p.getPageSize());
    }

    @Test
    void sizeEnElLimiteMaximoEsValido() throws Exception {
        PageRequest p = PageableFactory.crear(0, PageableFactory.SIZE_MAXIMO);
        assertEquals(PageableFactory.SIZE_MAXIMO, p.getPageSize());
    }

    @Test
    void pageSinSizeEsInvalido() {
        assertThrows(PaginacionInvalidaException.class,
                () -> PageableFactory.crear(1, null));
    }

    @Test
    void sizeSinPageEsInvalido() {
        assertThrows(PaginacionInvalidaException.class,
                () -> PageableFactory.crear(null, 10));
    }

    @Test
    void pageNegativoEsInvalido() {
        assertThrows(PaginacionInvalidaException.class,
                () -> PageableFactory.crear(-1, 10));
    }

    @Test
    void sizeCeroEsInvalido() {
        assertThrows(PaginacionInvalidaException.class,
                () -> PageableFactory.crear(0, 0));
    }

    @Test
    void sizeNegativoEsInvalido() {
        assertThrows(PaginacionInvalidaException.class,
                () -> PageableFactory.crear(0, -5));
    }

    @Test
    void sizeMayorAlMaximoEsInvalido() {
        assertThrows(PaginacionInvalidaException.class,
                () -> PageableFactory.crear(0, PageableFactory.SIZE_MAXIMO + 1));
    }
}

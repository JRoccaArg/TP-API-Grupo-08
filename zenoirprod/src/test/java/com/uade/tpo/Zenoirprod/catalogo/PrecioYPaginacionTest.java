package com.uade.tpo.Zenoirprod.catalogo;

import static org.assertj.core.api.Assertions.*;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import com.uade.tpo.Zenoirprod.util.PrecioCalculator;
import com.uade.tpo.Zenoirprod.util.PageableFactory;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;

class PrecioYPaginacionTest {
    @ParameterizedTest @CsvSource({"35000,20,28000.00", "0.05,10,0.04", "100,100,0.00", "100,0,100.00"})
    void precioFinalRespetaDescuentoYRedondeo(String precio, String descuento, String esperado) {
        assertThat(PrecioCalculator.precioConDescuento(new BigDecimal(precio), new BigDecimal(descuento)))
            .isEqualByComparingTo(esperado);
    }
    @Test void subtotalConCentavosNoAcumulaErrorBinario() {
        assertThat(PrecioCalculator.subtotal(new BigDecimal("42499.99"),3)).isEqualByComparingTo("127499.97");
    }
    @Test void valoresOpcionalesNoInventanDescuentos() {
        assertThat(PrecioCalculator.precioConDescuento(new BigDecimal("10"),null)).isEqualByComparingTo("10.00");
        assertThat(PrecioCalculator.precioConDescuento(null,null)).isEqualByComparingTo("0.00");
    }
    @Test void listadoSinParametrosConservaDefaults() throws Exception {
        var pagina = PageableFactory.crear(null,null);
        assertThat(pagina.getPageNumber()).isZero(); assertThat(pagina.getPageSize()).isEqualTo(20);
    }
    @Test void aceptaUltimoTamanoPermitido() throws Exception {
        assertThat(PageableFactory.crear(2,100).getOffset()).isEqualTo(200);
    }
    @Test void rechazaCadaParametroFaltante() {
        assertThatThrownBy(() -> PageableFactory.crear(0,null)).isInstanceOf(PaginacionInvalidaException.class);
        assertThatThrownBy(() -> PageableFactory.crear(null,6)).isInstanceOf(PaginacionInvalidaException.class);
    }
}

package com.uade.tpo.Zenoirprod.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class PrecioCalculator {

    public static final int ESCALA = 2;

    public static final RoundingMode REDONDEO = RoundingMode.HALF_UP;

    private static final BigDecimal CIEN = BigDecimal.valueOf(100);

    private PrecioCalculator() {
    }

    public static BigDecimal normalizar(BigDecimal importe) {
        if (importe == null) {
            return BigDecimal.ZERO.setScale(ESCALA);
        }
        return importe.setScale(ESCALA, REDONDEO);
    }

    public static BigDecimal montoDescuento(BigDecimal precio, BigDecimal porcentajeDescuento) {
        if (precio == null) {
            return BigDecimal.ZERO.setScale(ESCALA);
        }
        BigDecimal porcentaje = porcentajeDescuento == null ? BigDecimal.ZERO : porcentajeDescuento;
        if (porcentaje.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(ESCALA);
        }
        return precio.multiply(porcentaje).divide(CIEN, ESCALA, REDONDEO);
    }

    public static BigDecimal precioConDescuento(BigDecimal precio, BigDecimal porcentajeDescuento) {
        if (precio == null) {
            return BigDecimal.ZERO.setScale(ESCALA);
        }
        return normalizar(precio.subtract(montoDescuento(precio, porcentajeDescuento)));
    }

    public static BigDecimal subtotal(BigDecimal precioUnitario, int cantidad) {
        if (precioUnitario == null) {
            return BigDecimal.ZERO.setScale(ESCALA);
        }
        return normalizar(precioUnitario.multiply(BigDecimal.valueOf(cantidad)));
    }
}

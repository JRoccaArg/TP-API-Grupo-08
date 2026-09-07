package com.uade.tpo.Zenoirprod.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Punto unico de calculo y redondeo de precios del sistema.
 *
 * Convencion: el descuento se calcula primero como un monto en pesos redondeado
 * a 2 decimales, y recien despues se resta del precio. Se hace asi (y no como
 * precio * (1 - pct/100)) para que el monto del descuento sea un valor de dinero
 * real y auditable, que se puede mostrar como linea aparte en un comprobante.
 *
 * Todo el sistema debe usar esta clase: si se calcula el precio con descuento en
 * dos lugares con formulas distintas, el catalogo y la compra pueden diferir en
 * centavos para el mismo tipo de entrada.
 */
public final class PrecioCalculator {

    /** Decimales con los que se persiste y se muestra cualquier importe. */
    public static final int ESCALA = 2;

    /** Modo de redondeo unico para todo el sistema. */
    public static final RoundingMode REDONDEO = RoundingMode.HALF_UP;

    private static final BigDecimal CIEN = BigDecimal.valueOf(100);

    private PrecioCalculator() {
    }

    /** Normaliza cualquier importe a la escala y redondeo del sistema. */
    public static BigDecimal normalizar(BigDecimal importe) {
        if (importe == null) {
            return BigDecimal.ZERO.setScale(ESCALA);
        }
        return importe.setScale(ESCALA, REDONDEO);
    }

    /** Monto de descuento en pesos, redondeado. */
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

    /** Precio final de una unidad, ya con el descuento aplicado. */
    public static BigDecimal precioConDescuento(BigDecimal precio, BigDecimal porcentajeDescuento) {
        if (precio == null) {
            return BigDecimal.ZERO.setScale(ESCALA);
        }
        return normalizar(precio.subtract(montoDescuento(precio, porcentajeDescuento)));
    }

    /** Subtotal de una linea: precio unitario por cantidad. */
    public static BigDecimal subtotal(BigDecimal precioUnitario, int cantidad) {
        if (precioUnitario == null) {
            return BigDecimal.ZERO.setScale(ESCALA);
        }
        return normalizar(precioUnitario.multiply(BigDecimal.valueOf(cantidad)));
    }
}

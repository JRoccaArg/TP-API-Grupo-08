package com.uade.tpo.Zenoirprod.util;

// Ayudas para validar textos antes de guardarlos: un texto mas largo que la columna de la base daria un error 500.
public final class Textos {

    private Textos() {
    }

    public static boolean vacio(String texto) {
        return texto == null || texto.isBlank();
    }

    // Un texto (puede ser null) que supera el largo maximo permitido.
    public static boolean excede(String texto, int maximo) {
        return texto != null && texto.trim().length() > maximo;
    }
}

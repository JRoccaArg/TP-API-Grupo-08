package com.uade.tpo.Zenoirprod.util;

// Para validar textos antes de guardarlos: uno más largo que la columna de la base daría un error 500
public final class Textos {

    private Textos() {
    }

    public static boolean vacio(String texto) {
        return texto == null || texto.isBlank();
    }

    public static boolean excede(String texto, int maximo) {
        return texto != null && texto.trim().length() > maximo;
    }
}

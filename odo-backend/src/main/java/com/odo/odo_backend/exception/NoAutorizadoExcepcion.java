package com.odo.odo_backend.exception;

public class NoAutorizadoExcepcion extends RuntimeException {
    public NoAutorizadoExcepcion(String mensaje) {
        super(mensaje);
    }
}

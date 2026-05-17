package com.odo.odo_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @Builder @AllArgsConstructor
public class AutenticacionRespuesta {
    private String token;
    private UsuarioRespuesta usuario;
}

package com.odo.odo_backend.dto.response;

import com.odo.odo_backend.model.Usuario;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class UsuarioRespuesta {
    private Long id;
    private String nombre;
    private String email;
    private Usuario.Rol rol;
    private boolean activo;
    private boolean debeActualizarContrasena;
    private Long pacienteId;
    private String fotoPerfil;
    private LocalDateTime creadoEn;

    public static UsuarioRespuesta from(Usuario u) {
        return UsuarioRespuesta.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .email(u.getEmail())
                .rol(u.getRol())
                .activo(u.isActivo())
                .debeActualizarContrasena(u.isDebeActualizarContrasena())
                .pacienteId(u.getPacienteId())
                .fotoPerfil(u.getFotoPerfil())
                .creadoEn(u.getCreadoEn())
                .build();
    }
}

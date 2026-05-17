package com.odo.odo_backend.dto.request;

import com.odo.odo_backend.model.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UsuarioRequest {

    @NotBlank(message = "El nombre es requerido")
    private String nombre;

    @Email(message = "Email inválido")
    @NotBlank(message = "El email es requerido")
    private String email;

    private String contrasena;

    @NotNull(message = "El rol es requerido")
    private Usuario.Rol rol;
}

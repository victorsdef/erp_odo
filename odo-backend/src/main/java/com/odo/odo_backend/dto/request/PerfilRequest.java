package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PerfilRequest {

    @NotBlank(message = "El nombre es requerido")
    private String nombre;

    @Email(message = "Email inválido")
    @NotBlank(message = "El email es requerido")
    private String email;

    private String contrasenaActual;
    private String nuevaContrasena;
}

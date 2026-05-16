package com.odo.odo_backend.dto.request;

import com.odo.odo_backend.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank(message = "El nombre es requerido")
    private String name;

    @Email(message = "Email inválido")
    @NotBlank(message = "El email es requerido")
    private String email;

    private String password;

    @NotNull(message = "El rol es requerido")
    private User.Role role;
}

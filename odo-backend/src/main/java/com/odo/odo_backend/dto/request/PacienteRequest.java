package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PacienteRequest {
    @NotBlank private String nombre;
    @NotBlank private String apellido;
    private String dni;
    private String telefono;
    private String email;
    private String direccion;
    private LocalDate fechaNacimiento;
    private String notas;
}

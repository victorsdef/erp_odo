package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TratamientoRequest {
    @NotBlank(message = "El nombre es requerido")
    private String nombre;
    private String descripcion;
    @Positive private BigDecimal precioBase;
    @Positive private Integer duracionMinutos;
}

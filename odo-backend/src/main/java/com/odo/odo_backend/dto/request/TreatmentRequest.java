package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TreatmentRequest {
    @NotBlank(message = "El nombre es requerido")
    private String name;
    private String description;
    @Positive private BigDecimal defaultPrice;
    @Positive private Integer durationMinutes;
}

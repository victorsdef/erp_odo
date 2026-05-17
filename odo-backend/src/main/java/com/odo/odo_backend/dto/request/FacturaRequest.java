package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class FacturaRequest {
    @NotNull private Long pacienteId;
    private Long dentistaId;
    @NotNull @Positive private BigDecimal total;
    private String descripcion;
    @Min(1) private int numeroCuotas = 1;
}

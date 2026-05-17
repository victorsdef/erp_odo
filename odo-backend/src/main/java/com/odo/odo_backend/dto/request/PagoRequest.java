package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PagoRequest {
    @NotNull @Positive
    private BigDecimal monto;
    private String notas;
}

package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class InvoiceRequest {
    @NotNull private Long patientId;
    private Long dentistId;
    @NotNull @Positive private BigDecimal total;
    private String description;
    @Min(1) private int installmentCount = 1;
}

package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CitaRequest {
    @NotNull private Long pacienteId;
    @NotNull private Long dentistaId;
    @NotNull private LocalDateTime fechaHora;
    private Integer duracionMinutos;
    private String motivo;
    private String notas;
}

package com.odo.odo_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    @NotNull private Long patientId;
    @NotNull private Long dentistId;
    @NotNull private LocalDateTime dateTime;
    private Integer durationMinutes;
    private String reason;
    private String notes;
}

package com.odo.odo_backend.dto.response;

import com.odo.odo_backend.model.Treatment;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class TreatmentResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal defaultPrice;
    private Integer durationMinutes;
    private boolean active;
    private LocalDateTime createdAt;

    public static TreatmentResponse from(Treatment t) {
        return TreatmentResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .description(t.getDescription())
                .defaultPrice(t.getDefaultPrice())
                .durationMinutes(t.getDurationMinutes())
                .active(t.isActive())
                .createdAt(t.getCreatedAt())
                .build();
    }
}

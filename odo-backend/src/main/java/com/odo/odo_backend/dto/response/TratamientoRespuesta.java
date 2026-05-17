package com.odo.odo_backend.dto.response;

import com.odo.odo_backend.model.Tratamiento;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class TratamientoRespuesta {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precioBase;
    private Integer duracionMinutos;
    private boolean activo;
    private LocalDateTime creadoEn;

    public static TratamientoRespuesta from(Tratamiento t) {
        return TratamientoRespuesta.builder()
                .id(t.getId())
                .nombre(t.getNombre())
                .descripcion(t.getDescripcion())
                .precioBase(t.getPrecioBase())
                .duracionMinutos(t.getDuracionMinutos())
                .activo(t.isActivo())
                .creadoEn(t.getCreadoEn())
                .build();
    }
}

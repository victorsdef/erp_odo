package com.odo.odo_backend.dto.response;

import com.odo.odo_backend.model.ConfiguracionSistema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConfiguracionSistemaRespuesta {

    private String nombre;
    private String logoArchivo;

    public static ConfiguracionSistemaRespuesta from(ConfiguracionSistema c) {
        return ConfiguracionSistemaRespuesta.builder()
                .nombre(c.getNombre())
                .logoArchivo(c.getLogoArchivo())
                .build();
    }
}

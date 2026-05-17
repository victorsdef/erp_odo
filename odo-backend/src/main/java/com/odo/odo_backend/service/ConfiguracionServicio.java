package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.response.ConfiguracionSistemaRespuesta;
import com.odo.odo_backend.model.ConfiguracionSistema;
import com.odo.odo_backend.repository.ConfiguracionSistemaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ConfiguracionServicio {

    private final ConfiguracionSistemaRepositorio repositorio;
    private final MinioServicio                   minioServicio;

    public ConfiguracionSistemaRespuesta obtener() {
        return ConfiguracionSistemaRespuesta.from(getOrCreate());
    }

    public ConfiguracionSistemaRespuesta actualizarNombre(String nombre) {
        ConfiguracionSistema config = getOrCreate();
        config.setNombre(nombre);
        return ConfiguracionSistemaRespuesta.from(repositorio.save(config));
    }

    public ConfiguracionSistemaRespuesta actualizarLogo(MultipartFile archivo) throws Exception {
        ConfiguracionSistema config   = getOrCreate();
        String               fullPath = minioServicio.subirArchivo(archivo, "sistema");
        String               nombre   = fullPath.substring(fullPath.lastIndexOf('/') + 1);
        config.setLogoArchivo(nombre);
        return ConfiguracionSistemaRespuesta.from(repositorio.save(config));
    }

    private ConfiguracionSistema getOrCreate() {
        return repositorio.findById(1L).orElseGet(() -> {
            ConfiguracionSistema c = new ConfiguracionSistema();
            c.setId(1L);
            c.setNombre("ODO Clinic");
            return repositorio.save(c);
        });
    }
}

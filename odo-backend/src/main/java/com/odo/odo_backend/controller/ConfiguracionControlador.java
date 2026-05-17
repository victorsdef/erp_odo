package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.response.ConfiguracionSistemaRespuesta;
import com.odo.odo_backend.service.ConfiguracionServicio;
import com.odo.odo_backend.service.MinioServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/config")
@RequiredArgsConstructor
public class ConfiguracionControlador {

    private final ConfiguracionServicio configuracionServicio;
    private final MinioServicio         minioServicio;

    @GetMapping
    public ResponseEntity<ConfiguracionSistemaRespuesta> obtener() {
        return ResponseEntity.ok(configuracionServicio.obtener());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracionSistemaRespuesta> actualizar(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(configuracionServicio.actualizarNombre(body.get("nombre")));
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracionSistemaRespuesta> actualizarLogo(@RequestParam("logo") MultipartFile logo) throws Exception {
        return ResponseEntity.ok(configuracionServicio.actualizarLogo(logo));
    }

    @GetMapping("/logo/{filename:.+}")
    public ResponseEntity<InputStreamResource> verLogo(@PathVariable String filename) throws Exception {
        InputStream stream = minioServicio.obtenerArchivo("sistema/" + filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                .contentType(MediaType.IMAGE_PNG)
                .body(new InputStreamResource(stream));
    }
}

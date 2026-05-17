package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.request.PerfilRequest;
import com.odo.odo_backend.dto.response.UsuarioRespuesta;
import com.odo.odo_backend.service.MinioServicio;
import com.odo.odo_backend.service.PerfilServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class PerfilControlador {

    private final PerfilServicio perfilServicio;
    private final MinioServicio  minioServicio;

    @GetMapping
    public ResponseEntity<UsuarioRespuesta> obtenerPerfil() {
        return ResponseEntity.ok(perfilServicio.obtenerPerfil());
    }

    @PutMapping
    public ResponseEntity<UsuarioRespuesta> actualizarPerfil(@Valid @RequestBody PerfilRequest request) {
        return ResponseEntity.ok(perfilServicio.actualizarPerfil(request));
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UsuarioRespuesta> subirFoto(@RequestParam("foto") MultipartFile foto) throws Exception {
        return ResponseEntity.ok(perfilServicio.actualizarFoto(foto));
    }

    @GetMapping("/photo/{filename:.+}")
    public ResponseEntity<InputStreamResource> verFoto(@PathVariable String filename) throws Exception {
        InputStream stream = minioServicio.obtenerFoto("perfil/" + filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                .contentType(MediaType.IMAGE_JPEG)
                .body(new InputStreamResource(stream));
    }
}

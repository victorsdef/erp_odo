package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.request.UsuarioRequest;
import com.odo.odo_backend.dto.response.UsuarioRespuesta;
import com.odo.odo_backend.service.UsuarioServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UsuarioControlador {

    private final UsuarioServicio usuarioServicio;

    @GetMapping
    public ResponseEntity<List<UsuarioRespuesta>> obtenerTodos() {
        return ResponseEntity.ok(usuarioServicio.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioRespuesta> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioServicio.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioRespuesta> crear(@Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioServicio.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioRespuesta> actualizar(@PathVariable Long id,
                                                        @Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioServicio.actualizar(id, request));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<UsuarioRespuesta> alternarActivo(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioServicio.alternarActivo(id));
    }
}

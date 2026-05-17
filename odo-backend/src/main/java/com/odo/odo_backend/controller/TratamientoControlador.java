package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.request.TratamientoRequest;
import com.odo.odo_backend.dto.response.TratamientoRespuesta;
import com.odo.odo_backend.service.TratamientoServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TratamientoControlador {

    private final TratamientoServicio tratamientoServicio;

    @GetMapping("/api/treatments")
    public ResponseEntity<List<TratamientoRespuesta>> obtenerActivos() {
        return ResponseEntity.ok(tratamientoServicio.obtenerActivos());
    }

    @GetMapping("/api/admin/treatments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TratamientoRespuesta>> obtenerTodos() {
        return ResponseEntity.ok(tratamientoServicio.obtenerTodos());
    }

    @PostMapping("/api/admin/treatments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TratamientoRespuesta> crear(@Valid @RequestBody TratamientoRequest req) {
        return ResponseEntity.ok(tratamientoServicio.crear(req));
    }

    @PutMapping("/api/admin/treatments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TratamientoRespuesta> actualizar(@PathVariable Long id,
                                                            @Valid @RequestBody TratamientoRequest req) {
        return ResponseEntity.ok(tratamientoServicio.actualizar(id, req));
    }

    @PatchMapping("/api/admin/treatments/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TratamientoRespuesta> alternarActivo(@PathVariable Long id) {
        return ResponseEntity.ok(tratamientoServicio.alternarActivo(id));
    }

    @DeleteMapping("/api/admin/treatments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        tratamientoServicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

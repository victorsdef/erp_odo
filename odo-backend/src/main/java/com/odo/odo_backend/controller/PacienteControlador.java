package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.request.PacienteRequest;
import com.odo.odo_backend.dto.response.PacienteRespuesta;
import com.odo.odo_backend.service.PacienteServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PacienteControlador {

    private final PacienteServicio pacienteServicio;

    @GetMapping
    public ResponseEntity<List<PacienteRespuesta>> obtenerTodos() {
        return ResponseEntity.ok(pacienteServicio.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteRespuesta> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pacienteServicio.obtenerPorId(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PacienteRespuesta>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(pacienteServicio.buscar(q));
    }

    @PreAuthorize("hasAnyRole('ADMIN','DENTIST','RECEPTIONIST')")
    @PostMapping
    public ResponseEntity<PacienteRespuesta> crear(@Valid @RequestBody PacienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteServicio.crear(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','DENTIST','RECEPTIONIST')")
    @PutMapping("/{id}")
    public ResponseEntity<PacienteRespuesta> actualizar(@PathVariable Long id,
                                                         @Valid @RequestBody PacienteRequest request) {
        return ResponseEntity.ok(pacienteServicio.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pacienteServicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

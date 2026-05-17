package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.request.CitaRequest;
import com.odo.odo_backend.model.Cita;
import com.odo.odo_backend.service.CitaServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class CitaControlador {

    private final CitaServicio citaServicio;

    @GetMapping
    public ResponseEntity<List<Cita>> obtenerTodas() {
        return ResponseEntity.ok(citaServicio.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(citaServicio.obtenerPorId(id));
    }

    @GetMapping("/patient/{pacienteId}")
    public ResponseEntity<List<Cita>> obtenerPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(citaServicio.obtenerPorPaciente(pacienteId));
    }

    @PostMapping
    public ResponseEntity<Cita> crear(@Valid @RequestBody CitaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaServicio.crear(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Cita> actualizarEstado(@PathVariable Long id,
                                                  @RequestParam Cita.Estado estado) {
        return ResponseEntity.ok(citaServicio.actualizarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        citaServicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

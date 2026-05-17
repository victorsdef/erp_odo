package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.request.FacturaRequest;
import com.odo.odo_backend.dto.request.PagoRequest;
import com.odo.odo_backend.dto.response.FacturaRespuesta;
import com.odo.odo_backend.service.FacturaServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class FacturaControlador {

    private final FacturaServicio facturaServicio;

    @GetMapping
    public ResponseEntity<List<FacturaRespuesta>> obtenerTodas() {
        return ResponseEntity.ok(facturaServicio.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacturaRespuesta> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(facturaServicio.obtenerPorId(id));
    }

    @GetMapping("/patient/{pacienteId}")
    public ResponseEntity<List<FacturaRespuesta>> obtenerPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(facturaServicio.obtenerPorPaciente(pacienteId));
    }

    @PostMapping
    public ResponseEntity<FacturaRespuesta> crear(@Valid @RequestBody FacturaRequest req) {
        return ResponseEntity.ok(facturaServicio.crear(req));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<FacturaRespuesta> registrarPago(@PathVariable Long id,
                                                           @Valid @RequestBody PagoRequest req) {
        return ResponseEntity.ok(facturaServicio.registrarPago(id, req));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        facturaServicio.cancelar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        facturaServicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.request.TreatmentRequest;
import com.odo.odo_backend.dto.response.TreatmentResponse;
import com.odo.odo_backend.service.TreatmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TreatmentController {

    private final TreatmentService treatmentService;

    @GetMapping("/api/treatments")
    public ResponseEntity<List<TreatmentResponse>> getActive() {
        return ResponseEntity.ok(treatmentService.getActive());
    }

    @GetMapping("/api/admin/treatments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TreatmentResponse>> getAll() {
        return ResponseEntity.ok(treatmentService.getAll());
    }

    @PostMapping("/api/admin/treatments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TreatmentResponse> create(@Valid @RequestBody TreatmentRequest req) {
        return ResponseEntity.ok(treatmentService.create(req));
    }

    @PutMapping("/api/admin/treatments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TreatmentResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody TreatmentRequest req) {
        return ResponseEntity.ok(treatmentService.update(id, req));
    }

    @PatchMapping("/api/admin/treatments/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TreatmentResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(treatmentService.toggleActive(id));
    }

    @DeleteMapping("/api/admin/treatments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        treatmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.odo.odo_backend.controller;

import com.odo.odo_backend.dto.request.InvoiceRequest;
import com.odo.odo_backend.dto.request.PaymentRequest;
import com.odo.odo_backend.dto.response.InvoiceResponse;
import com.odo.odo_backend.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAll() {
        return ResponseEntity.ok(invoiceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<InvoiceResponse>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceService.getByPatient(patientId));
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(@Valid @RequestBody InvoiceRequest req) {
        return ResponseEntity.ok(invoiceService.create(req));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<InvoiceResponse> registerPayment(@PathVariable Long id,
                                                           @Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(invoiceService.registerPayment(id, req));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        invoiceService.cancel(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

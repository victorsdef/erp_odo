package com.odo.odo_backend.service;

import com.odo.odo_backend.dto.request.InvoiceRequest;
import com.odo.odo_backend.dto.request.PaymentRequest;
import com.odo.odo_backend.dto.response.InvoiceResponse;
import com.odo.odo_backend.exception.ResourceNotFoundException;
import com.odo.odo_backend.model.Invoice;
import com.odo.odo_backend.model.InvoicePayment;
import com.odo.odo_backend.model.User;
import com.odo.odo_backend.repository.InvoicePaymentRepository;
import com.odo.odo_backend.repository.InvoiceRepository;
import com.odo.odo_backend.repository.PatientRepository;
import com.odo.odo_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoicePaymentRepository paymentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public List<InvoiceResponse> getAll() {
        return invoiceRepository.findAll().stream()
                .map(inv -> InvoiceResponse.from(inv, paymentRepository.findByInvoiceIdOrderByPaidAtAsc(inv.getId())))
                .toList();
    }

    public List<InvoiceResponse> getByPatient(Long patientId) {
        return invoiceRepository.findByPatientId(patientId).stream()
                .map(inv -> InvoiceResponse.from(inv, paymentRepository.findByInvoiceIdOrderByPaidAtAsc(inv.getId())))
                .toList();
    }

    public InvoiceResponse getById(Long id) {
        Invoice inv = find(id);
        return InvoiceResponse.from(inv, paymentRepository.findByInvoiceIdOrderByPaidAtAsc(id));
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest req) {
        var patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));
        User dentist = req.getDentistId() != null
                ? userRepository.findById(req.getDentistId()).orElse(null) : null;

        Invoice inv = Invoice.builder()
                .patient(patient)
                .dentist(dentist)
                .total(req.getTotal())
                .description(req.getDescription())
                .installmentCount(Math.max(1, req.getInstallmentCount()))
                .build();
        return InvoiceResponse.from(invoiceRepository.save(inv), List.of());
    }

    @Transactional
    public InvoiceResponse registerPayment(Long id, PaymentRequest req) {
        Invoice inv = find(id);

        if (inv.getStatus() == Invoice.Status.PAID || inv.getStatus() == Invoice.Status.CANCELLED) {
            throw new IllegalArgumentException("Esta factura ya está " + inv.getStatus().name().toLowerCase());
        }

        BigDecimal remaining = inv.getTotal().subtract(inv.getPaid());
        if (req.getAmount().compareTo(remaining) > 0) {
            throw new IllegalArgumentException(
                    "El monto excede el saldo pendiente (" + remaining + ")");
        }

        InvoicePayment payment = InvoicePayment.builder()
                .invoice(inv)
                .amount(req.getAmount())
                .notes(req.getNotes())
                .build();
        paymentRepository.save(payment);

        BigDecimal newPaid = inv.getPaid().add(req.getAmount());
        inv.setPaid(newPaid);

        if (newPaid.compareTo(inv.getTotal()) >= 0) {
            inv.setStatus(Invoice.Status.PAID);
            inv.setPaidAt(LocalDateTime.now());
        } else {
            inv.setStatus(Invoice.Status.PARTIAL);
        }
        invoiceRepository.save(inv);

        return InvoiceResponse.from(inv, paymentRepository.findByInvoiceIdOrderByPaidAtAsc(id));
    }

    @Transactional
    public void cancel(Long id) {
        Invoice inv = find(id);
        inv.setStatus(Invoice.Status.CANCELLED);
        invoiceRepository.save(inv);
    }

    public void delete(Long id) {
        invoiceRepository.delete(find(id));
    }

    private Invoice find(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada"));
    }
}

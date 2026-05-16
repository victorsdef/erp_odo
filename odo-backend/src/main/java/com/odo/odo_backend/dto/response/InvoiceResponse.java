package com.odo.odo_backend.dto.response;

import com.odo.odo_backend.model.Invoice;
import com.odo.odo_backend.model.InvoicePayment;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class InvoiceResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long dentistId;
    private String dentistName;
    private BigDecimal total;
    private BigDecimal paid;
    private BigDecimal balance;
    private String description;
    private Invoice.Status status;
    private int installmentCount;
    private BigDecimal installmentAmount;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private List<PaymentDetail> payments;

    @Data @Builder
    public static class PaymentDetail {
        private Long id;
        private BigDecimal amount;
        private String notes;
        private LocalDateTime paidAt;

        public static PaymentDetail from(InvoicePayment p) {
            return PaymentDetail.builder()
                    .id(p.getId())
                    .amount(p.getAmount())
                    .notes(p.getNotes())
                    .paidAt(p.getPaidAt())
                    .build();
        }
    }

    public static InvoiceResponse from(Invoice inv, List<InvoicePayment> payments) {
        BigDecimal balance = inv.getTotal().subtract(inv.getPaid());
        BigDecimal installmentAmt = inv.getInstallmentCount() > 1
                ? inv.getTotal().divide(BigDecimal.valueOf(inv.getInstallmentCount()), 2, java.math.RoundingMode.HALF_UP)
                : inv.getTotal();
        String patient = inv.getPatient() != null
                ? inv.getPatient().getFirstName() + " " + inv.getPatient().getLastName() : null;
        String dentist = inv.getDentist() != null ? inv.getDentist().getName() : null;

        return InvoiceResponse.builder()
                .id(inv.getId())
                .patientId(inv.getPatient() != null ? inv.getPatient().getId() : null)
                .patientName(patient)
                .dentistId(inv.getDentist() != null ? inv.getDentist().getId() : null)
                .dentistName(dentist)
                .total(inv.getTotal())
                .paid(inv.getPaid())
                .balance(balance.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : balance)
                .description(inv.getDescription())
                .status(inv.getStatus())
                .installmentCount(inv.getInstallmentCount())
                .installmentAmount(installmentAmt)
                .createdAt(inv.getCreatedAt())
                .paidAt(inv.getPaidAt())
                .payments(payments.stream().map(PaymentDetail::from).toList())
                .build();
    }
}

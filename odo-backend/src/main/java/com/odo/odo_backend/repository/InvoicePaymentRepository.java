package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.InvoicePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoicePaymentRepository extends JpaRepository<InvoicePayment, Long> {
    List<InvoicePayment> findByInvoiceIdOrderByPaidAtAsc(Long invoiceId);
}

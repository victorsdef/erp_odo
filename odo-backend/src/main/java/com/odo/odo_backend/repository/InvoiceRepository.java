package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatientId(Long patientId);
    List<Invoice> findByStatus(Invoice.Status status);
}

package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FacturaRepositorio extends JpaRepository<Factura, Long> {
    List<Factura> findByPacienteId(Long pacienteId);
    List<Factura> findByEstado(Factura.Estado estado);
}

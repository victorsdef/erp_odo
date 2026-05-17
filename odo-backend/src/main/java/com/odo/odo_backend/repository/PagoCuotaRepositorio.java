package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.PagoCuota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PagoCuotaRepositorio extends JpaRepository<PagoCuota, Long> {
    List<PagoCuota> findByFacturaIdOrderByPagadoEnAsc(Long facturaId);
}

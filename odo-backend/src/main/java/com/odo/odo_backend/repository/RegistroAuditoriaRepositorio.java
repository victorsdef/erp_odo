package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.RegistroAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistroAuditoriaRepositorio extends JpaRepository<RegistroAuditoria, Long> {

    @Query("SELECT r FROM RegistroAuditoria r WHERE " +
           "(:usuarioId IS NULL OR r.usuarioId = :usuarioId) AND " +
           "(:accion IS NULL OR r.accion = :accion) " +
           "ORDER BY r.creadoEn DESC")
    Page<RegistroAuditoria> findFiltrado(
            @Param("usuarioId") Long usuarioId,
            @Param("accion")    RegistroAuditoria.Accion accion,
            Pageable pageable);
}

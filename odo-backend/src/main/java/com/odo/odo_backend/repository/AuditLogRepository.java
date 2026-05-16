package com.odo.odo_backend.repository;

import com.odo.odo_backend.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:action IS NULL OR a.action = :action) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> findFiltered(
            @Param("userId")  Long userId,
            @Param("action")  AuditLog.Action action,
            Pageable pageable);
}

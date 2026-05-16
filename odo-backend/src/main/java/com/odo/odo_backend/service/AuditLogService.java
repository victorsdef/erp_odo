package com.odo.odo_backend.service;

import com.odo.odo_backend.model.AuditLog;
import com.odo.odo_backend.model.User;
import com.odo.odo_backend.repository.AuditLogRepository;
import com.odo.odo_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void log(AuditLog.Action action,
                    String entityType, String entityId,
                    String description,
                    String ip, String userAgent) {

        String email = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "anonymous";

        Long userId = null;
        String userName = email;
        User.Role role = null;

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            var u = userOpt.get();
            userId   = u.getId();
            userName = u.getName();
            role     = u.getRole();
        }

        auditLogRepository.save(AuditLog.builder()
                .userId(userId)
                .userName(userName)
                .userRole(role)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .ipAddress(ip)
                .userAgent(userAgent)
                .build());
    }

    public Page<AuditLog> findFiltered(Long userId, AuditLog.Action action, Pageable pageable) {
        return auditLogRepository.findFiltered(userId, action, pageable);
    }
}

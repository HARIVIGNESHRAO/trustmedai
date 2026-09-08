package com.trustmedai.backend.service;

import com.trustmedai.backend.entity.AuditLog;
import com.trustmedai.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void log(
            String email,
            String action,
            String description,
            String status,
            String ip
    ) {

        AuditLog log = AuditLog.builder()
                .userEmail(email)
                .action(action)
                .description(description)
                .status(status)
                .ipAddress(ip)
                .createdAt(LocalDateTime.now())
                .build();

        repository.save(log);
    }
}
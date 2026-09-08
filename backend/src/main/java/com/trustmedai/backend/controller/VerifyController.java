package com.trustmedai.backend.controller;

import com.trustmedai.backend.entity.PredictionHistory;
import com.trustmedai.backend.repository.PredictionHistoryRepository;
import com.trustmedai.backend.service.QRCodeService;
import com.trustmedai.backend.service.FabricLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VerifyController {

    private final PredictionHistoryRepository predictionHistoryRepository;
    private final FabricLedgerService fabricLedgerService;
    @GetMapping("/verify-report/{hash}")
    public ResponseEntity<?> verifyReport(
            @PathVariable String hash
    ) {

        Optional<PredictionHistory> history =
                predictionHistoryRepository.findByCurrentHash(hash);

        if (history.isEmpty()) {

            return ResponseEntity.ok(
                    Map.of(
                            "verified", false,
                            "message", "Report not found or has been modified."
                    )
            );
        }

        PredictionHistory report = history.get();

        Map<String, Object> response = new HashMap<>();

        boolean fabricCommitted = "FABRIC_COMMITTED".equals(report.getLedgerStatus());
        Map<String, Object> ledgerVerification = fabricCommitted
                ? fabricLedgerService.verifyReportProof(report.getId(), report.getReportHash())
                : Map.of("verified", true, "message", "Verified against the local integrity chain.");

        response.put("verified", Boolean.TRUE.equals(ledgerVerification.get("verified")));
        response.put("message", ledgerVerification.get("message"));

        response.put("reportName", report.getReportName());
        response.put("userEmail", report.getUserEmail());
        response.put("createdAt", report.getCreatedAt());
        response.put("blockNumber", report.getBlockNumber());
        response.put("currentHash", report.getCurrentHash());
        response.put("ledgerStatus", report.getLedgerStatus());
        response.put("fabricTransactionId", report.getFabricTransactionId());
        response.put("fabricChannel", report.getFabricChannel());
        response.put("fabricVerification", ledgerVerification);

        return ResponseEntity.ok(response);
    }
    private final QRCodeService qrCodeService;
    @GetMapping(value = "/test-qr", produces = "image/png")
    public byte[] testQR() {

        return qrCodeService.generateQRCode(
                "https://www.google.com",
                300,
                300
        );
    }
}

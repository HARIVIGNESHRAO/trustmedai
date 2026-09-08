package com.trustmedai.backend.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

@Service
public class MetricsService {

    private final Counter reportsUploaded;
    private final Counter predictionsMade;
    private final Counter pdfDownloads;
    private final Counter blockchainVerifications;
    private final Counter hospitalRecommendations;
    private final Counter successfulLogins;

    public MetricsService(MeterRegistry registry) {

        reportsUploaded =
                Counter.builder("trustmedai_reports_uploaded_total")
                        .description("Total Reports Uploaded")
                        .register(registry);

        predictionsMade =
                Counter.builder("trustmedai_predictions_total")
                        .description("Total AI Predictions")
                        .register(registry);

        pdfDownloads =
                Counter.builder("trustmedai_pdf_downloads_total")
                        .description("Total PDF Downloads")
                        .register(registry);

        blockchainVerifications =
                Counter.builder("trustmedai_blockchain_verifications_total")
                        .description("Blockchain Verification Requests")
                        .register(registry);

        hospitalRecommendations =
                Counter.builder("trustmedai_hospital_recommendations_total")
                        .description("Hospital Recommendation Requests")
                        .register(registry);

        successfulLogins =
                Counter.builder("trustmedai_successful_logins_total")
                        .description("Successful User Logins")
                        .register(registry);
    }

    public void reportUploaded() {
        reportsUploaded.increment();
    }

    public void predictionMade() {
        predictionsMade.increment();
    }

    public void pdfDownloaded() {
        pdfDownloads.increment();
    }

    public void blockchainVerified() {
        blockchainVerifications.increment();
    }

    public void hospitalRecommended() {
        hospitalRecommendations.increment();
    }

    public void loginSuccess() {
        successfulLogins.increment();
    }
}
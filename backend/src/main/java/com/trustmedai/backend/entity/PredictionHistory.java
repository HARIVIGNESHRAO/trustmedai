package com.trustmedai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class PredictionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    private String reportName;

    @Column(columnDefinition = "TEXT")
    private String predictionResult;
    @Column(columnDefinition = "TEXT")
    private String hospitalRecommendations;
    @Column(columnDefinition = "TEXT")
    private String healthParameters;
    private LocalDateTime createdAt;
    @Column(columnDefinition = "TEXT")
    private String reportHash;

    @Column(columnDefinition = "TEXT")
    private String previousHash;

    @Column(columnDefinition = "TEXT")
    private String currentHash;

    private Integer blockNumber;

    /** Hyperledger Fabric transaction metadata. No clinical data is stored on-chain. */
    private String fabricTransactionId;
    private String fabricChannel;
    private String fabricChaincode;
    private String ledgerStatus;

}

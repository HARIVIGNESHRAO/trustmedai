package com.trustmedai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class HospitalRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long predictionHistoryId;

    private String hospitalName;

    private String specialist;

    private Double hss;

    private Double rating;

    private Double distance;

    private Integer priority;
}
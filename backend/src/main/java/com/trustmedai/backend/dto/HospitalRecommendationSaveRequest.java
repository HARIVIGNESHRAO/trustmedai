package com.trustmedai.backend.dto;

import lombok.Data;

@Data
public class HospitalRecommendationSaveRequest {

    private Long predictionId;

    private String hospitalRecommendations;

}
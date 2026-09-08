package com.trustmedai.backend.repository;

import com.trustmedai.backend.entity.HospitalRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HospitalRecommendationRepository
        extends JpaRepository<HospitalRecommendation, Long> {

    List<HospitalRecommendation> findByPredictionHistoryIdOrderByPriorityAsc(
            Long predictionHistoryId
    );

}
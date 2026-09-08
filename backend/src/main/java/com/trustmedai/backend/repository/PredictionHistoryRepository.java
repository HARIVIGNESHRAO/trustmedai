package com.trustmedai.backend.repository;

import com.trustmedai.backend.entity.PredictionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
public interface PredictionHistoryRepository
        extends JpaRepository<PredictionHistory, Long> {

    List<PredictionHistory> findByUserEmail(String userEmail);

    PredictionHistory findTopByOrderByIdDesc();
    PredictionHistory findTopByOrderByBlockNumberDesc();
    List<PredictionHistory> findAllByOrderByBlockNumberAsc();
    Optional<PredictionHistory> findByCurrentHash(String currentHash);
}
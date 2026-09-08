package com.trustmedai.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class TrendResponse {

    private String parameter;

    private String unit;

    private Double current;

    private Double highest;

    private Double lowest;

    private Double previous;

    private Double percentageChange;

    private String trend;

    private String riskLevel;

    private Double normalMin;

    private Double normalMax;

    private String aiSummary;

    private List<Map<String,Object>> history;

}
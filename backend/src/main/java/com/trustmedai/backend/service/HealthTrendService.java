package com.trustmedai.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustmedai.backend.dto.TrendResponse;
import com.trustmedai.backend.entity.PredictionHistory;
import com.trustmedai.backend.util.NormalRangeUtil;
import com.trustmedai.backend.util.RiskCalculator;
import com.trustmedai.backend.util.SummaryGenerator;
import org.springframework.stereotype.Service;
import com.trustmedai.backend.util.TrendCalculator;
import java.util.*;

@Service
public class HealthTrendService {

    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, TrendResponse> generateTrend(
            List<PredictionHistory> reports
    ) {

        Map<String, List<Map<String, Object>>> trends =
                new HashMap<>();

        System.out.println("========== HEALTH TREND DEBUG ==========");
        System.out.println("TOTAL REPORTS = " + reports.size());

        try {

            reports.sort(
                    Comparator.comparing(
                            PredictionHistory::getCreatedAt
                    )
            );

            for (PredictionHistory report : reports) {

                System.out.println("------------------------------------");
                System.out.println("REPORT = " + report.getReportName());

                System.out.println("HEALTH PARAMETERS JSON = ");
                System.out.println(report.getHealthParameters());

                if (report.getHealthParameters() == null) {

                    System.out.println("Health Parameters are NULL");
                    continue;

                }

                Map<String, Object> params =
                        mapper.readValue(
                                report.getHealthParameters(),
                                new TypeReference<Map<String, Object>>() {}
                        );

                System.out.println("PARSED PARAMETERS = " + params);

                for (String key : params.keySet()) {

                    Object value = params.get(key);

                    System.out.println(
                            "KEY = " + key +
                                    " | VALUE = " + value +
                                    " | TYPE = " +
                                    value.getClass().getSimpleName()
                    );

                    if (!(value instanceof Number)) {

                        System.out.println("Skipped (Not a Number)");
                        continue;

                    }

                    trends
                            .computeIfAbsent(
                                    key,
                                    k -> new ArrayList<>()
                            )
                            .add(
                                    Map.of(
                                            "date",
                                            report.getCreatedAt(),
                                            "value",
                                            value
                                    )
                            );

                    System.out.println("Added to Trend");

                }

            }

        } catch (Exception e) {

            e.printStackTrace();

        }

        System.out.println("========== FINAL TRENDS ==========");
        System.out.println(trends);
        Map<String, TrendResponse> response =
                new HashMap<>();
        for (String parameter : trends.keySet()) {

            List<Map<String, Object>> history = trends.get(parameter);
            TrendResponse trend = new TrendResponse();

            trend.setParameter(parameter);

            trend.setHistory(history);
        }
        for (String parameter : trends.keySet()) {

            List<Map<String, Object>> history = trends.get(parameter);

            TrendResponse trend = new TrendResponse();

            trend.setParameter(parameter);
            trend.setHistory(history);

            List<Double> values = new ArrayList<>();

            for (Map<String, Object> point : history) {

                values.add(
                        ((Number) point.get("value")).doubleValue()
                );

            }

            double current = values.get(values.size() - 1);
            double highest = Collections.max(values);
            double lowest = Collections.min(values);

            trend.setCurrent(current);
            trend.setHighest(highest);
            trend.setLowest(lowest);

            if (values.size() >= 2) {

                double previous = values.get(values.size() - 2);

                trend.setPrevious(previous);

                trend.setTrend(
                        TrendCalculator.getTrend(previous, current)
                );

                double change =
                        ((current - previous) / previous) * 100.0;

                trend.setPercentageChange(
                        Math.round(change * 100.0) / 100.0
                );

            } else {

                trend.setTrend("Stable");

            }

            double[] range =
                    NormalRangeUtil.NORMALS.getOrDefault(
                            parameter,
                            new double[]{0, 0}
                    );

            trend.setNormalMin(range[0]);
            trend.setNormalMax(range[1]);

            String risk =
                    RiskCalculator.getRisk(
                            current,
                            range[0],
                            range[1]
                    );

            trend.setRiskLevel(risk);

            trend.setAiSummary(
                    SummaryGenerator.generate(
                            parameter,
                            current,
                            range[0],
                            range[1],
                            risk
                    )
            );

            response.put(parameter, trend);
        }

        return response;

    }

}
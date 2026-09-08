package com.trustmedai.backend.util;

public class TrendCalculator {

    public static String getTrend(double previous, double current) {

        if (current > previous) {
            return "Increasing";
        }

        if (current < previous) {
            return "Decreasing";
        }

        return "Stable";
    }
}
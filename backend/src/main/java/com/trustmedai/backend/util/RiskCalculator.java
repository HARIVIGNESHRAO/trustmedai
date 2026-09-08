package com.trustmedai.backend.util;

public class RiskCalculator {

    public static String getRisk(
            double value,
            double min,
            double max
    ){

        if(value<min)
            return "Low";

        if(value<=max)
            return "Normal";

        if(value<=max*1.5)
            return "Moderate";

        return "High";

    }

}
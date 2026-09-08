package com.trustmedai.backend.util;

public class SummaryGenerator {

    public static String generate(

            String parameter,

            double current,

            double min,

            double max,

            String risk

    ){

        if(risk.equals("Normal")){

            return parameter +
                    " is within the normal range.";

        }

        return parameter +
                " is outside the normal range. Current value is "
                + current +
                ". Recommendation: consult your physician and repeat testing if clinically indicated.";

    }

}
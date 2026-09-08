package com.trustmedai.backend.util;

import java.util.Map;

public class NormalRangeUtil {

    public static final Map<String,double[]> NORMALS = Map.of(

            "totalBilirubin", new double[]{0.3,1.2},

            "directBilirubin", new double[]{0.0,0.3},

            "ast", new double[]{10,40},

            "alt", new double[]{7,56},

            "albumin", new double[]{3.5,5.0},

            "creatinine", new double[]{0.6,1.3},

            "glucose", new double[]{70,99}

    );

}
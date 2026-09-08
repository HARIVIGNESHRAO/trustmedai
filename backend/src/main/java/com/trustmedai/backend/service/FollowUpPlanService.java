package com.trustmedai.backend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FollowUpPlanService {

    public Map<String, Object> generate(String disease,String risk) {

        Map<String, Object> plan = new HashMap<>();

        switch (disease.toLowerCase()) {

            // ==========================
            // DIABETES
            // ==========================
            case "diabetes":
                if (risk.equalsIgnoreCase("high")){
                    plan.put("specialist", "Endocrinologist");

                    plan.put("followUp", "Repeat blood sugar tests after 3 months.");
                }
                else{
                    plan.put("specialist", "General Physician");
                    plan.put("followUp", "Continue a healthy lifestyle and repeat LFT during routine health check-ups.");
                }

                plan.put("tests", List.of(
                        "HbA1c",
                        "Fasting Blood Sugar",
                        "Post Prandial Blood Sugar (PPBS)",
                        "Urine Sugar Test"
                ));

                plan.put("lifestyle", List.of(
                        "Reduce sugar intake.",
                        "Walk at least 30 minutes daily.",
                        "Maintain healthy body weight.",
                        "Drink adequate water.",
                        "Monitor blood glucose regularly."
                ));

                break;

            // ==========================
            // HEART DISEASE
            // ==========================
            case "heart disease":
                if (risk.equalsIgnoreCase("high")){
                    plan.put("specialist", "Cardiologist");

                    plan.put("followUp", "Schedule a cardiac review within 3-6 months.");
                }else{
                    plan.put("specialist", "General Physician");
                    plan.put("followUp", "Continue a healthy lifestyle and repeat LFT during routine health check-ups.");
                }

                plan.put("tests", List.of(
                        "ECG",
                        "2D Echocardiogram",
                        "Lipid Profile",
                        "Blood Pressure Monitoring"
                ));

                plan.put("lifestyle", List.of(
                        "Reduce salt intake.",
                        "Exercise regularly.",
                        "Quit smoking and alcohol.",
                        "Maintain healthy cholesterol.",
                        "Manage stress effectively."
                ));

                break;

            // ==========================
            // KIDNEY DISEASE
            // ==========================
            case "kidney disease":
                if (risk.equalsIgnoreCase("high")) {
                    plan.put("specialist", "Nephrologist");

                    plan.put("followUp", "Repeat kidney function tests after 3 months.");
                }
                else{
                        plan.put("specialist", "General Physician");
                        plan.put("followUp", "Continue a healthy lifestyle and repeat LFT during routine health check-ups.");
                    }
                plan.put("tests", List.of(
                        "Serum Creatinine",
                        "eGFR",
                        "Blood Urea",
                        "Urine Albumin"
                ));

                plan.put("lifestyle", List.of(
                        "Drink adequate water.",
                        "Reduce sodium intake.",
                        "Avoid unnecessary painkillers.",
                        "Control blood pressure.",
                        "Monitor kidney function regularly."
                ));

                break;

            // ==========================
            // LIVER DISEASE
            // ==========================
            case "liver disease":
                if (risk.equalsIgnoreCase("high")){
                    plan.put("specialist", "Hepatologist / Gastroenterologist");

                    plan.put("followUp", "Repeat liver function tests after 3 months.");
                }
                else{
                    plan.put("specialist", "General Physician");
                    plan.put("followUp", "Continue a healthy lifestyle and repeat LFT during routine health check-ups.");
                }
                plan.put("tests", List.of(
                        "Liver Function Test (LFT)",
                        "ALT (SGPT)",
                        "AST (SGOT)",
                        "Bilirubin"
                ));

                plan.put("lifestyle", List.of(
                        "Avoid alcohol completely.",
                        "Eat a balanced healthy diet.",
                        "Maintain healthy body weight.",
                        "Exercise regularly.",
                        "Avoid unnecessary medications."
                ));

                break;

            // ==========================
            // THYROID DISEASE
            // ==========================
            case "thyroid disease":
                if (risk.equalsIgnoreCase("high")){
                    plan.put("specialist", "Endocrinologist");

                    plan.put("followUp", "Repeat thyroid profile after 6-12 weeks.");
                }
                else{
                    plan.put("specialist", "General Physician");
                    plan.put("followUp", "Continue a healthy lifestyle and repeat LFT during routine health check-ups.");
                }
                plan.put("tests", List.of(
                        "TSH",
                        "T3",
                        "T4",
                        "Free T4"
                ));

                plan.put("lifestyle", List.of(
                        "Take thyroid medication exactly as prescribed.",
                        "Maintain balanced iodine intake.",
                        "Get adequate sleep.",
                        "Exercise regularly.",
                        "Monitor thyroid levels periodically."
                ));

                break;

            // ==========================
            // DEFAULT
            // ==========================
            default:

                plan.put("specialist", "General Physician");

                plan.put("followUp", "Consult your physician for further evaluation.");

                plan.put("tests", List.of());

                plan.put("lifestyle", List.of(
                        "Maintain a healthy diet.",
                        "Exercise regularly.",
                        "Stay hydrated.",
                        "Schedule regular health checkups."
                ));
        }

        plan.put(
                "warning",
                "⚠ This follow-up plan is AI-generated for clinical decision support only. It is not a medical prescription. Please consult a qualified healthcare professional."
        );

        return plan;
    }
}
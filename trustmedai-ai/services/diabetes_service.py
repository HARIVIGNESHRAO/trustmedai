import pickle
import shap
import numpy as np

with open("models/diabetes_model.pkl", "rb") as f:
    diabetes_model = pickle.load(f)

with open("models/diabetes_scaler.pkl", "rb") as f:
    diabetes_scaler = pickle.load(f)

# SHAP Explainer
explainer = shap.TreeExplainer(diabetes_model)
def predict_diabetes(params, age):

    pregnancies = params.get("pregnancies", 3)
    glucose = params.get("glucose", 120)
    blood_pressure = params.get("bloodPressure", 72)
    skin_thickness = params.get("skinThickness", 29)
    insulin = params.get("insulin", 125)
    bmi = params.get("bmi", 28)
    dpf = params.get("diabetesPedigreeFunction", 0.47)

    input_data = [[
        pregnancies,
        glucose,
        blood_pressure,
        skin_thickness,
        insulin,
        bmi,
        dpf,
        age
    ]]

    scaled = diabetes_scaler.transform(input_data)

    pred = diabetes_model.predict(scaled)
    prob = diabetes_model.predict_proba(scaled)
    print("\n========== DIABETES DEBUG ==========")
    print("Prediction:", pred[0])
    print("Raw Probabilities:", prob[0])
    print("Probability Class 0 (No Diabetes):", prob[0][0])
    print("Probability Class 1 (Diabetes):", prob[0][1])

    # =====================
    # SHAP
    # =====================

    feature_names = [
        "Pregnancies",
        "Glucose",
        "Blood Pressure",
        "Skin Thickness",
        "Insulin",
        "BMI",
        "Diabetes Pedigree Function",
        "Age"
    ]

    try:

        shap_values = explainer.shap_values(scaled)

        # RandomForest binary classifier handling
        if isinstance(shap_values, list):
            values = shap_values[1][0]
        else:
            values = shap_values[0]

        feature_impacts = []

        for i in range(len(feature_names)):

            feature_impacts.append({
                "feature": feature_names[i],
                "impact": round(
                    float(values[i]),
                    4
                )
            })

        feature_impacts = sorted(
            feature_impacts,
            key=lambda x: abs(x["impact"]),
            reverse=True
        )

        top_factors = feature_impacts[:3]

    except Exception as e:

        print("SHAP Error:", e)

        top_factors = []

    return {
        "disease": "Diabetes",
        "prediction": int(pred[0]),
        "risk": "High" if pred[0] == 1 else "Low",
"probability": round(
    float(prob[0][1]) * 100,
    2
),
        "topFactors": top_factors
    }
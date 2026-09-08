import pickle
import shap
with open("models/kidney_model.pkl", "rb") as f:
    kidney_model = pickle.load(f)

with open("models/kidney_scaler.pkl", "rb") as f:
    kidney_scaler = pickle.load(f)

explainer = shap.TreeExplainer(
    kidney_model
)
def predict_kidney(params, age):

    kidney_input = [[
        age,
        params.get("bloodPressure", 80),
        1.020,
        1,
        0,
        1,
        1,
        0,
        0,
        121,
        params.get("bloodUrea", 40),
        params.get("creatinine", 1.2),
        params.get("sodium", 138),
        params.get("potassium", 4.5),
        params.get("hemoglobin", 15),
        44,
        8400,
        5.2,
        0,
        0,
        0,
        1,
        0,
        0
    ]]

    kidney_scaled = kidney_scaler.transform(
        kidney_input
    )

    pred = kidney_model.predict(
        kidney_scaled
    )

    prob = kidney_model.predict_proba(
        kidney_scaled
    )

    feature_names = [
        "Age",
        "Blood Pressure",
        "Specific Gravity",
        "Albumin",
        "Sugar",
        "RBC",
        "Pus Cell",
        "Pus Cell Clumps",
        "Bacteria",
        "Blood Glucose Random",
        "Blood Urea",
        "Serum Creatinine",
        "Sodium",
        "Potassium",
        "Hemoglobin",
        "Packed Cell Volume",
        "White Blood Cell Count",
        "Red Blood Cell Count",
        "Hypertension",
        "Diabetes Mellitus",
        "Coronary Artery Disease",
        "Appetite",
        "Pedal Edema",
        "Anemia"
    ]

    try:

        shap_values = explainer.shap_values(
            kidney_scaled
        )

        if isinstance(shap_values, list):
            values = shap_values[1][0]
        else:
            values = shap_values[0]

        feature_impacts = []

        for i in range(
            len(feature_names)
        ):

            feature_impacts.append({
                "feature":
                    feature_names[i],

                "impact":
                    round(
                        float(values[i]),
                        4
                    )
            })

        feature_impacts = sorted(
            feature_impacts,
            key=lambda x:
                abs(x["impact"]),
            reverse=True
        )

        top_factors = (
            feature_impacts[:3]
        )

    except Exception as e:

        print(
            "Kidney SHAP Error:",
            e
        )

        top_factors = []

    return {
        "disease":
            "Kidney Disease",

        "prediction":
            int(pred[0]),

        "risk":
            "High"
            if pred[0] == 1
            else "Low",

        "probability":
            round(
                float(
                    max(prob[0])
                ) * 100,
                2
            ),

        "topFactors":
            top_factors
    }
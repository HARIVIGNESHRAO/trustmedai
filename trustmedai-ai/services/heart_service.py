import pickle
import shap

with open("models/heart_model.pkl", "rb") as f:
    heart_model = pickle.load(f)

with open("models/heart_scaler.pkl", "rb") as f:
    heart_scaler = pickle.load(f)
explainer = shap.TreeExplainer(
    heart_model
)
def predict_heart(params, age, gender):

    sex = 1 if gender.lower() == "male" else 0

    heart_input = [[
        age,
        sex,
        0,
        params.get("cp", 2),
        params.get("bloodPressure", 130),
        params.get("cholesterol", 240),
        params.get("fbs", 0),
        params.get("restecg", 1),
        params.get("thalach", 150),
        params.get("exang", 0),
        params.get("oldpeak", 1.0),
        params.get("slope", 1),
        params.get("ca", 0),
        params.get("thal", 2)
    ]]

    scaled = heart_scaler.transform(
        heart_input
    )

    pred = heart_model.predict(
        scaled
    )

    prob = heart_model.predict_proba(
        scaled
    )

    feature_names = [
        "Age",
        "Sex",
        "Dummy",
        "Chest Pain Type",
        "Blood Pressure",
        "Cholesterol",
        "Fasting Blood Sugar",
        "Rest ECG",
        "Maximum Heart Rate",
        "Exercise Angina",
        "Oldpeak",
        "Slope",
        "Major Vessels",
        "Thalassemia"
    ]

    try:

        shap_values = explainer.shap_values(
            scaled
        )

        if isinstance(
            shap_values,
            list
        ):
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
            "Heart SHAP Error:",
            e
        )

        top_factors = []

    return {
        "disease":
            "Heart Disease",

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
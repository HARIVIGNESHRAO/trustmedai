import pickle
import shap
with open("models/liver_model.pkl", "rb") as f:
    liver_model = pickle.load(f)

with open("models/liver_scaler.pkl", "rb") as f:
    liver_scaler = pickle.load(f)

explainer = shap.TreeExplainer(
    liver_model
)
def predict_liver(params, age, gender):

    gender_encoded = (
        1 if gender.lower() == "male"
        else 0
    )

    liver_input = [[
        age,
        gender_encoded,
        params.get(
            "totalBilirubin",
            1.0
        ),
        params.get(
            "directBilirubin",
            0.3
        ),
        params.get(
            "alkalinePhosphatase",
            210
        ),
        params.get(
            "altSgpt",
            35
        ),
        params.get(
            "astSgot",
            40
        ),
        params.get(
            "totalProteins",
            6.8
        ),
        params.get(
            "albumin",
            3.5
        ),
        params.get(
            "agRatio",
            1.0
        )
    ]]

    liver_scaled = (
        liver_scaler.transform(
            liver_input
        )
    )

    pred = liver_model.predict(
        liver_scaled
    )

    prob = (
        liver_model.predict_proba(
            liver_scaled
        )
    )

    feature_names = [
        "Age",
        "Gender",
        "Total Bilirubin",
        "Direct Bilirubin",
        "Alkaline Phosphatase",
        "ALT (SGPT)",
        "AST (SGOT)",
        "Total Proteins",
        "Albumin",
        "A/G Ratio"
    ]

    try:

        shap_values = (
            explainer.shap_values(
                liver_scaled
            )
        )

        if isinstance(
            shap_values,
            list
        ):
            values = (
                shap_values[1][0]
            )
        else:
            values = (
                shap_values[0]
            )

        feature_impacts = []

        for i in range(
            len(feature_names)
        ):

            feature_impacts.append({
                "feature":
                    feature_names[i],

                "impact":
                    round(
                        float(
                            values[i]
                        ),
                        4
                    )
            })

        feature_impacts = sorted(
            feature_impacts,
            key=lambda x:
                abs(
                    x["impact"]
                ),
            reverse=True
        )

        top_factors = (
            feature_impacts[:3]
        )

    except Exception as e:

        print(
            "Liver SHAP Error:",
            e
        )

        top_factors = []

    return {

        "disease":
            "Liver Disease",

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
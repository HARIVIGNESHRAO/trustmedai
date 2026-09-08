import pickle
import shap
with open("models/thyroid_model.pkl", "rb") as f:
    thyroid_model = pickle.load(f)

with open("models/thyroid_scaler.pkl", "rb") as f:
    thyroid_scaler = pickle.load(f)

explainer = shap.TreeExplainer(
    thyroid_model
)
def predict_thyroid(params, age, gender):

    sex = 1 if gender.lower() == "male" else 0

    thyroid_input = [[
        age,
        sex,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        params.get("tsh", 2.5),
        1,
        params.get("t3", 120),
        1,
        params.get("tt4", 8),
        1,
        params.get("t4u", 1.1),
        1,
        params.get("fti", 110),
        1,
        params.get("tbg", 25),
        0
    ]]

    thyroid_scaled = thyroid_scaler.transform(
        thyroid_input
    )

    pred = thyroid_model.predict(
        thyroid_scaled
    )

    prob = thyroid_model.predict_proba(
        thyroid_scaled
    )

    feature_names = [
        "Age",
        "Sex",
        "On Thyroxine",
        "Query On Thyroxine",
        "On Antithyroid Meds",
        "Sick",
        "Pregnant",
        "Thyroid Surgery",
        "I131 Treatment",
        "Query Hypothyroid",
        "Query Hyperthyroid",
        "Lithium",
        "Goitre",
        "Tumor",
        "Hypopituitary",
        "Psych",
        "TSH Measured",
        "TSH",
        "T3 Measured",
        "T3",
        "TT4 Measured",
        "TT4",
        "T4U Measured",
        "T4U",
        "FTI Measured",
        "FTI",
        "TBG Measured",
        "TBG",
        "Referral Source"
    ]

    try:

        shap_values = explainer.shap_values(
            thyroid_scaled
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
            "Thyroid SHAP Error:",
            e
        )

        top_factors = []

    return {
        "disease":
            "Thyroid Disease",

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
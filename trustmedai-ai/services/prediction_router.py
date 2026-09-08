def run_predictions(params, age, gender):

    results = []

    if (
        params.get("glucose") is not None
        or params.get("bmi") is not None
    ):
        results.append(
            predict_diabetes(params, age)
        )

    if (
        params.get("cholesterol") is not None
        or params.get("cp") is not None
        or params.get("thalach") is not None
    ):
        results.append(
            predict_heart(params, age, gender)
        )

    if (
        params.get("creatinine") is not None
        or params.get("bloodUrea") is not None
    ):
        results.append(
            predict_kidney(params, age)
        )

    if (
        params.get("albumin") is not None
        or params.get("totalBilirubin") is not None
    ):
        results.append(
            predict_liver(params, age, gender)
        )

    if (
        params.get("tsh") is not None
        or params.get("t3") is not None
        or params.get("tt4") is not None
    ):
        results.append(
            predict_thyroid(params, age, gender)
        )

    return results
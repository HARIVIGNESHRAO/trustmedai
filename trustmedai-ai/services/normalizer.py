# ==========================
# PARAMETER NORMALIZATION
# ==========================

NORMALIZATION_MAP = {

    # Diabetes

    "randomBloodSugar": "glucose",
    "fastingGlucose": "glucose",
    "bloodGlucose": "glucose",
    "rbs": "glucose",
    "fbs": "glucose",
    "ppbs": "glucose",

    # Heart

    "totalCholesterol": "cholesterol",
    "chol": "cholesterol",

    # Kidney

    "serumCreatinine": "creatinine",

    # Liver

    "bilirubin": "totalBilirubin",
    "sgpt": "alt",
    "sgot": "ast",

    # CBC

    "hb": "hemoglobin",
    "haemoglobin": "hemoglobin",

    # Thyroid

    "thyroxine": "tt4"

}


def normalize_parameters(params):

    normalized = {}

    for key, value in params.items():

        key = NORMALIZATION_MAP.get(key, key)

        normalized[key] = value

    return normalized
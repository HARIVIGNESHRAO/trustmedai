import re

from services.regex_patterns import ALL_PATTERNS

TEXT_PARAMETERS = {
    "name",
    "gender",
}
# =========================
# MEDICAL REPORT VALIDATION
# =========================

MEDICAL_KEYWORDS = [

    "report",
    "laboratory",
    "lab",

    "glucose",
    "blood sugar",
    "fasting",

    "cholesterol",

    "creatinine",
    "urea",

    "bilirubin",
    "albumin",

    "hemoglobin",
    "platelet",
    "wbc",
    "rbc",

    "thyroid",
    "tsh",
    "t3",
    "t4",

    "mg/dl",
    "g/dl"
]


def clean_ocr_text(text):

    text = text.lower()

    replacements = {
        "bloed": "blood",
        "bleod": "blood",
        "biood": "blood",
        "ccholesterat": "cholesterol",
        "cholestrol": "cholesterol",
        "cholesteral": "cholesterol",
        "triglyeerides": "triglycerides",
        "triglyceridees": "triglycerides",
        "creatinina": "creatinine",
        "creatinme": "creatinine",
        "tota bilirubin": "total bilirubin",
        "bilrubin": "bilirubin",
        "hemonne": "hemoglobin",
        "haemogiobin": "hemoglobin",
        "hemogiobin": "hemoglobin",
        "plateiet": "platelet",
        "mg / dl": "mg/dl",
        "mg/ dl": "mg/dl",
        "mg /dl": "mg/dl",
        "g / dl": "g/dl",
        "g/ dl": "g/dl",
        "g /dl": "g/dl",
    }

    for wrong, correct in replacements.items():

        text = text.replace(
            wrong,
            correct
        )

    text = re.sub(
        r"\b(hba1c|tsh|t3|t4|ft3|ft4|rbs|fbs|ppbs)(\d)",
        r"\1 \2",
        text
    )

    text = re.sub(
        r"(\d)\s*[oO]\s*(?=\d)",
        r"\g<1>0",
        text
    )

    text = re.sub(
        r"[|]",
        " ",
        text
    )

    text = re.sub(
        r"[ \t]+",
        " ",
        text
    )

    return text


def clean_patient_name(value):

    value = re.sub(
        r"\b(patient\s*id|report\s*id|age\s*/?\s*gender|referred\s*by|phone)\b.*$",
        "",
        value,
        flags=re.IGNORECASE
    )

    value = re.sub(
        r"\s+",
        " ",
        value
    ).strip(" :-")

    title_map = {
        "mr": "Mr",
        "mrs": "Mrs",
        "ms": "Ms",
        "miss": "Miss",
        "master": "Master",
        "dr": "Dr",
    }

    words = []

    for word in value.split():

        normalized = word.rstrip(".").lower()

        if normalized in title_map:
            words.append(title_map[normalized])
        else:
            words.append(word.capitalize())

    return " ".join(words)


def extract_number_after_label(line, label_pattern):

    if not re.search(label_pattern, line, re.IGNORECASE):
        return None

    remainder = re.sub(
        label_pattern,
        " ",
        line,
        count=1,
        flags=re.IGNORECASE
    )

    match = re.search(
        r"\b\d+(?:\.\d+)?\b",
        remainder
    )

    if not match:
        return None

    return float(match.group(0))


def extract_priority_fields(text):

    params = {}

    for line in text.splitlines():

        line = line.strip()

        if not line:
            continue

        name_match = re.search(
            r"\bname\b\s*[:\-]?\s*(.+?)(?=\s+\b(?:patient\s*id|report\s*id|age\s*/?\s*gender|referred\s*by|phone)\b|$)",
            line,
            re.IGNORECASE
        )

        if name_match and "name" not in params:

            cleaned_name = clean_patient_name(
                name_match.group(1)
            )

            if cleaned_name:
                params["name"] = cleaned_name

        hba1c = extract_number_after_label(
            line,
            r"\bhb\s*a?\s*1\s*c\b"
        )

        if hba1c is not None and "hba1c" not in params:
            params["hba1c"] = hba1c

        glucose = extract_number_after_label(
            line,
            r"\b(?:estimated average glucose|eag)\b"
        )

        if glucose is not None and "glucose" not in params:
            params["glucose"] = glucose

    return params


def is_medical_report(text):

    text = clean_ocr_text(text)

    matches = sum(
        1 for keyword in MEDICAL_KEYWORDS
        if keyword in text
    )

    print("Medical Keyword Matches:", matches)

    return matches >= 2


# =========================
# PARAMETER EXTRACTION
# =========================

def extract_parameters_regex(text):

    # -------------------------
    # OCR CLEANUP
    # -------------------------

    text = clean_ocr_text(text)

    params = extract_priority_fields(text)

   

    # -------------------------
    # PARAMETER PATTERNS
    # -------------------------

   
    # -------------------------
    # EXTRACT VALUES
    # -------------------------

# -------------------------
# UNIVERSAL PARAMETER EXTRACTION
# -------------------------

    for parameter, pattern_list in ALL_PATTERNS.items():

        if parameter in params:
            continue

        for pattern in pattern_list:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE
            )

            if not match:
                continue

            value = match.group(1)

            try:

                if parameter == "name":

                    cleaned_name = clean_patient_name(value)

                    if not cleaned_name:
                        continue

                    params[parameter] = cleaned_name

                elif parameter == "gender":

                    params[parameter] = value.capitalize()

                elif parameter == "age":

                    params[parameter] = int(value)

                else:

                    params[parameter] = float(value)

                break

            except:

                continue

    return params

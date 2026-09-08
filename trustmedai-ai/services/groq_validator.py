from groq import Groq
import json
import os
import re
from services.regex_patterns import ALL_PATTERNS

client = None

SUPPORTED_PARAMETERS = set(ALL_PATTERNS.keys())

GROQ_KEY_ALIASES = {
    "aToGRatio": "agRatio",
    "albuminGlobulinRatio": "agRatio",
    "totalProteins": "totalProtein",
    "bilirubinTotal": "totalBilirubin",
    "bilirubinDirect": "directBilirubin",
    "bilirubinIndirect": "indirectBilirubin",
    "sgpt": "alt",
    "sgot": "ast",
}

HIGH_RISK_LABEL_PATTERNS = {
    "sodium": r"\b(?:sodium|na\+|na)\b",
    "potassium": r"\b(?:potassium|k\+|k)\b",
}


def get_groq_client():

    global client

    if client is None:

        client = Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )

    return client


def can_merge_groq_value(key, text):

    label_pattern = HIGH_RISK_LABEL_PATTERNS.get(key)

    if not label_pattern:
        return True

    return re.search(
        label_pattern,
        text,
        re.IGNORECASE
    ) is not None

SYSTEM_PROMPT = """
You are an expert medical laboratory report validator.

You will receive:

1. OCR text

2. Parameters already extracted using Regex.

Your job:

1. Keep all regex values.

2. Extract ONLY missing parameters.

3. Never overwrite correct regex values.

4. Never invent values.

5. Return ONLY JSON.
6. Do not add derived ratio fields or unsupported parameter names.
7. Use the same parameter names already used in Regex Parameters.

Do NOT wrap the JSON inside markdown.
Do NOT use ```json.
Never generate dummy values.

If a value cannot be extracted from the OCR text,
do not include that field.

Only return values that explicitly appear in the report.
"""


def validate_with_groq(text, regex_params):

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        print("GROQ validation skipped: GROQ_API_KEY is not configured")
        return regex_params

    try:
        response = get_groq_client().chat.completions.create(

            model=os.getenv("GROQ_CHAT_MODEL", "llama-3.1-8b-instant"),

            messages=[

                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },

                {
                    "role": "user",
                    "content": f"""
OCR TEXT

{text}


Regex Parameters

{json.dumps(regex_params, indent=2)}
"""
                }

            ],

            temperature=0

        )
    except Exception as error:
        print(f"GROQ validation skipped: {error}")
        return regex_params

    output = response.choices[0].message.content.strip()

    # -------------------------
    # Remove Markdown
    # -------------------------

    if output.startswith("```json"):
        output = output.replace("```json", "", 1)

    if output.startswith("```"):
        output = output.replace("```", "", 1)

    if output.endswith("```"):
        output = output[:-3]

    output = output.strip()

    print("\n========== GROQ RAW ==========")
    print(output)

    try:

        groq_params = json.loads(output)

    except Exception as e:

        print("JSON Error:", e)

        return regex_params

    # -------------------------
    # Merge ONLY missing values
    # -------------------------

    final_params = regex_params.copy()

    for key, value in groq_params.items():

        key = GROQ_KEY_ALIASES.get(
            key,
            key
        )

        if key not in SUPPORTED_PARAMETERS:
            continue

        if not can_merge_groq_value(key, text):
            continue

        if (
            key not in final_params
            or final_params[key] in [None, "", 0]
        ):

            final_params[key] = value

    return final_params

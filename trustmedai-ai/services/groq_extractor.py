from groq import Groq
import json
import os

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)
SYSTEM_PROMPT = """
You are an expert medical laboratory report parser.

Your task is to extract every measurable medical parameter from the laboratory report.

Return ONLY valid JSON.

Instructions:

1. Extract all laboratory test names and their numeric values.
2. Normalize parameter names to camelCase.
3. Convert values to numbers whenever possible.
4. If a parameter is not present, do not invent it.
5. Ignore patient address, doctor names, hospital names, IDs, phone numbers and unrelated text.
6. Return ONLY JSON.
7. No markdown.
8. No explanation.

Example:

{
  "age": 52,
  "gender": "Male",
  "glucose": 182,
  "hba1c": 7.8,
  "cholesterol": 245,
  "hdl": 38,
  "ldl": 155,
  "triglycerides": 220,
  "creatinine": 1.6,
  "bloodUrea": 42,
  "uricAcid": 6.8,
  "albumin": 4.1,
  "totalProtein": 7.2,
  "totalBilirubin": 1.1,
  "directBilirubin": 0.3,
  "alt": 48,
  "ast": 52,
  "alp": 130,
  "hemoglobin": 12.8,
  "wbc": 7100,
  "rbc": 4.8,
  "platelets": 260000,
  "tsh": 8.5,
  "t3": 1.2,
  "tt4": 8.4
}
"""
def extract_parameters_regex(text):

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role":"system",
                "content":SYSTEM_PROMPT
            },

            {
                "role":"user",
                "content":text
            }

        ],

        temperature=0

    )

    output = response.choices[0].message.content

    return json.loads(output)
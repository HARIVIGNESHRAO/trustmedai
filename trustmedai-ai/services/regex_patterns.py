PATIENT_PATTERNS = {

    "name": [

        r'(?:patient\s*name|name)\s*[:\-]?\s*((?:mr\.?|mrs\.?|ms\.?|miss|master|dr\.?)?\s*[a-z][a-z .]+?)(?=\s{2,}| patient\s*id\b| report\s*id\b| age\s*/?\s*gender\b| referred\s*by\b| phone\b|$)',

        r'(?:patient\s*name|name)\s*[:\-]?\s*([a-z][a-z .]+?)(?=\s{2,}| patient\s*id\b| report\s*id\b| age\s*/?\s*gender\b| referred\s*by\b| phone\b|$)'

    ],

    "age": [

        r'age\s*/\s*gender\s*:?\s*(\d+)',

        r'age\s*:?\s*(\d+)',

        r'age\s*[-:]?\s*(\d+)',

        r'(\d+)\s*years',

        r'yrs?\s*:?\s*(\d+)'

    ],

    "gender": [

        r'age\s*/\s*gender\s*:?\s*\d+\s*/\s*(male|female)',

        r'gender\s*:?\s*(male|female)',

        r'sex\s*:?\s*(male|female)',

        r'\b(male|female)\b'

    ]
}
DIABETES_PATTERNS = {

    "glucose": [

        r'(?:estimated average glucose|eag)[^\d\n]*(\d+\.?\d*)',

        r'(?:random blood sugar)[^\d]*(\d+\.?\d*)',

        r'(?:blood glucose)[^\d]*(\d+\.?\d*)',

        r'(?:blood sugar)[^\d]*(\d+\.?\d*)',

        r'(?:fasting blood sugar)[^\d]*(\d+\.?\d*)',

        r'(?:fasting glucose)[^\d]*(\d+\.?\d*)',

        r'(?:glucose)[^\d]*(\d+\.?\d*)',

        r'(?:rbs)[^\d]*(\d+\.?\d*)',

        r'(?:fbs)[^\d]*(\d+\.?\d*)',

        r'(?:ppbs)[^\d]*(\d+\.?\d*)'
    ],

    "hba1c": [

        r'\bhba1c\b[^\d\n]*(\d+\.?\d*)',

        r'(?:glycated hemoglobin|glycosylated)[^\d\n]*(\d+\.?\d*)'
    ],

    "bmi":[

        r'(?:bmi)[^\d]*(\d+\.?\d*)'
    ]
}
HEART_PATTERNS = {

    "cholesterol":[

        r'(?:total cholesterol)[^\d]*(\d+\.?\d*)',

        r'(?:cholesterol)[^\d]*(\d+\.?\d*)'
    ],

    "hdl":[

        r'(?:hdl cholesterol)[^\d]*(\d+\.?\d*)',

        r'(?:hdl)[^\d]*(\d+\.?\d*)'
    ],

    "ldl":[

        r'(?:ldl cholesterol)[^\d]*(\d+\.?\d*)',

        r'(?:ldl)[^\d]*(\d+\.?\d*)'
    ],

    "triglycerides":[

        r'(?:triglycerides)[^\d]*(\d+\.?\d*)',

        r'(?:tg)[^\d]*(\d+\.?\d*)'
    ]
}
KIDNEY_PATTERNS = {

    "creatinine":[

        r'(?:serum creatinine)[^\d]*(\d+\.?\d*)',

        r'(?:creatinine)[^\d]*(\d+\.?\d*)'
    ],

    "bloodUrea":[

        r'(?:blood urea)[^\d]*(\d+\.?\d*)',

        r'(?:urea)[^\d]*(\d+\.?\d*)'
    ],

    "uricAcid":[

        r'(?:uric acid)[^\d]*(\d+\.?\d*)'
    ]
}
LIVER_PATTERNS = {

    "albumin":[

        r'(?:albumin)[^\d]*(\d+\.?\d*)'
    ],

    "totalBilirubin":[

        r'(?:total bilirubin)[^\d]*(\d+\.?\d*)',

        r'(?:bilirubin total)[^\d]*(\d+\.?\d*)',

        r'(?:bilirubin)[^\d]*(\d+\.?\d*)'
    ],

    "alt":[

        r'\b(?:alt|sgpt)\b[^\d]*(\d+\.?\d*)'
    ],

    "ast":[

        r'\b(?:ast|sgot)\b[^\d]*(\d+\.?\d*)'
    ],

    "alp":[

        r'(?:alp|alkaline phosphatase)[^\d]*(\d+\.?\d*)'
    ]
}
CBC_PATTERNS = {

    "hemoglobin":[

        r'\b(?:hemoglobin|hb)\b[^\d]*(\d+\.?\d*)'
    ],

    "wbc":[

        r'(?:white blood cell|wbc)[^\d]*(\d+)'
    ],

    "rbc":[

        r'(?:red blood cell|rbc)[^\d]*(\d+\.?\d*)'
    ],

    "platelets":[

        r'(?:platelet count|platelets?)[^\d]*(\d+)'
    ]
}
THYROID_PATTERNS = {

    "tsh":[

        r'(?:tsh)[^\d]*(\d+\.?\d*)'
    ],

    "t3":[

        r'(?:t3)[^\d]*(\d+\.?\d*)'
    ],

    "tt4":[

        r'(?:tt4|t4)[^\d]*(\d+\.?\d*)'
    ]
}
ALL_PATTERNS = {}

DIABETES_PATTERNS.update({

    "insulin":[
        r'(?:insulin)[^\d]*(\d+\.?\d*)'
    ],

    "cPeptide":[
        r'(?:c[- ]?peptide)[^\d]*(\d+\.?\d*)'
    ]

})
HEART_PATTERNS.update({

    "vldl":[
        r'(?:vldl)[^\d]*(\d+\.?\d*)'
    ],

    "nonHdl":[
        r'(?:non[- ]?hdl)[^\d]*(\d+\.?\d*)'
    ],

    "cholHdlRatio":[
        r'(?:cholesterol\s*/\s*hdl ratio)[^\d]*(\d+\.?\d*)'
    ]

})

KIDNEY_PATTERNS.update({

    "bun":[
        r'(?:bun)[^\d]*(\d+\.?\d*)',
        r'(?:blood urea nitrogen)[^\d]*(\d+\.?\d*)'
    ],

    "egfr":[
        r'(?:e.?gfr)[^\d]*(\d+\.?\d*)'
    ],

    "sodium":[
        r'\b(?:sodium|na\+)\b[^\d]*(\d+\.?\d*)',
        r'\bna\b[^\d]*(\d+\.?\d*)'
    ],

    "potassium":[
        r'\b(?:potassium|k\+)\b[^\d]*(\d+\.?\d*)',
        r'\bk\b[^\d]*(\d+\.?\d*)'
    ]

})

LIVER_PATTERNS.update({

    "directBilirubin":[
        r'(?:direct bilirubin)[^\d]*(\d+\.?\d*)',
        r'(?:bilirubin direct)[^\d]*(\d+\.?\d*)'
    ],

    "indirectBilirubin":[
        r'(?:indirect bilirubin)[^\d]*(\d+\.?\d*)',
        r'(?:bilirubin indirect)[^\d]*(\d+\.?\d*)'
    ],

    "globulin":[
        r'(?:globulin)[^\d]*(\d+\.?\d*)'
    ],

    "agRatio":[
        r'(?:a\s*:?\s*g ratio)[^\d]*(\d+\.?\d*)',
        r'(?:a/?g ratio)[^\d]*(\d+\.?\d*)'
    ],

    "totalProtein":[
        r'(?:total proteins?)[^\d]*(\d+\.?\d*)'
    ],

    "ggt":[
        r'(?:ggt|gamma glutamyl transferase)[^\d]*(\d+\.?\d*)'
    ]

})
CBC_PATTERNS.update({

    "hematocrit":[
        r'(?:hematocrit|hct)[^\d]*(\d+\.?\d*)'
    ],

    "mcv":[
        r'(?:mcv)[^\d]*(\d+\.?\d*)'
    ],

    "mch":[
        r'(?:mch)[^\d]*(\d+\.?\d*)'
    ],

    "mchc":[
        r'(?:mchc)[^\d]*(\d+\.?\d*)'
    ],

    "rdw":[
        r'(?:rdw)[^\d]*(\d+\.?\d*)'
    ],

    "neutrophils":[
        r'(?:neutrophils?)[^\d]*(\d+\.?\d*)'
    ],

    "lymphocytes":[
        r'(?:lymphocytes?)[^\d]*(\d+\.?\d*)'
    ],

    "monocytes":[
        r'(?:monocytes?)[^\d]*(\d+\.?\d*)'
    ],

    "eosinophils":[
        r'(?:eosinophils?)[^\d]*(\d+\.?\d*)'
    ],

    "basophils":[
        r'(?:basophils?)[^\d]*(\d+\.?\d*)'
    ]

})
THYROID_PATTERNS.update({

    "ft3":[
        r'(?:free t3|ft3)[^\d]*(\d+\.?\d*)'
    ],

    "ft4":[
        r'(?:free t4|ft4)[^\d]*(\d+\.?\d*)'
    ],

    "antiTpo":[
        r'(?:anti[- ]?tpo)[^\d]*(\d+\.?\d*)'
    ]

})
VITAMIN_PATTERNS = {

    "vitaminD":[
        r'(?:vitamin d)[^\d]*(\d+\.?\d*)'
    ],

    "vitaminB12":[
        r'(?:vitamin b12)[^\d]*(\d+\.?\d*)'
    ],

    "ferritin":[
        r'(?:ferritin)[^\d]*(\d+\.?\d*)'
    ],

    "iron":[
        r'(?:iron)[^\d]*(\d+\.?\d*)'
    ]

}
ELECTROLYTE_PATTERNS = {

    "chloride":[
        r'(?:chloride)[^\d]*(\d+\.?\d*)'
    ],

    "calcium":[
        r'(?:calcium)[^\d]*(\d+\.?\d*)'
    ],

    "magnesium":[
        r'(?:magnesium)[^\d]*(\d+\.?\d*)'
    ],

    "phosphorus":[
        r'(?:phosphorus|phosphate)[^\d]*(\d+\.?\d*)'
    ]

}
ALL_PATTERNS.update(PATIENT_PATTERNS)

ALL_PATTERNS.update(DIABETES_PATTERNS)

ALL_PATTERNS.update(HEART_PATTERNS)

ALL_PATTERNS.update(KIDNEY_PATTERNS)

ALL_PATTERNS.update(LIVER_PATTERNS)

ALL_PATTERNS.update(CBC_PATTERNS)

ALL_PATTERNS.update(THYROID_PATTERNS)
ALL_PATTERNS.update(VITAMIN_PATTERNS)
ALL_PATTERNS.update(ELECTROLYTE_PATTERNS)

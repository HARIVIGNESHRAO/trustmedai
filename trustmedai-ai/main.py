from dotenv import load_dotenv
import os
import math
import re
import uuid
load_dotenv()
from fastapi import FastAPI, UploadFile, File,Form
from pdf2image import convert_from_path
from typing import Dict,Optional
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from services.diabetes_service import predict_diabetes
from services.heart_service import predict_heart
from services.liver_service import predict_liver
from services.kidney_service import predict_kidney
from services.thyroid_service import predict_thyroid
from services.ocr_service import is_medical_report
from services.hospital_scraper import (
    extract_specialists,
    extract_facilities
)
from services.normalizer import normalize_parameters
from services.ocr_service import extract_parameters_regex
from services.groq_validator import validate_with_groq
from services.voice_service import transcribe_audio
from pydantic import BaseModel
from typing import List
import requests

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
ALLOWED_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf"
]
AUDIO_EXTENSIONS = [
    ".webm",
    ".wav",
    ".mp3",
    ".m4a",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".ogg",
]
OCR_CONFIGS = [
    "--oem 3 --psm 6",
    "--oem 3 --psm 11",
    "--oem 3 --psm 4",
]
OCR_MEDICAL_HINTS = [
    "glucose",
    "cholesterol",
    "creatinine",
    "bilirubin",
    "hemoglobin",
    "platelet",
    "thyroid",
    "tsh",
    "mg/dl",
    "g/dl",
]
DISEASE_SPECIALISTS = {
    "Diabetes": "Endocrinologist",
    "Heart Disease": "Cardiologist",
    "Kidney Disease": "Nephrologist",
    "Liver Disease": "Gastroenterologist",
    "Thyroid Disease": "Endocrinologist"
}
DISEASE_FACILITIES = {

    "Diabetes": [
        "Emergency",
        "MRI"
    ],

    "Heart Disease": [
        "Emergency",
        "MRI"
    ],

    "Kidney Disease": [
        "Dialysis",
        "Emergency"
    ],

    "Liver Disease": [
        "MRI",
        "Emergency"
    ],

    "Thyroid Disease": [
        "MRI"
    ]
}

app = FastAPI()
def calculate_hss(
    specialist_match,
    facility_match,
    distance_score,
    rating_score
):

    hss = (

        0.40 *
        specialist_match

        +

        0.30 *
        facility_match

        +

        0.20 *
        distance_score

        +

        0.10 *
        rating_score

    )

    return round(
        hss,
        2
    )
def calculate_distance_km(
    lat1,
    lon1,
    lat2,
    lon2
):

    R = 6371

    dlat = math.radians(
        lat2 - lat1
    )

    dlon = math.radians(
        lon2 - lon1
    )

    a = (
        math.sin(dlat / 2) ** 2
        +
        math.cos(
            math.radians(lat1)
        )
        *
        math.cos(
            math.radians(lat2)
        )
        *
        math.sin(dlon / 2) ** 2
    )

    c = (
        2
        *
        math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a)
        )
    )

    return R * c
class PredictionRequest(BaseModel):
    age: int
    gender: str
    parameters: Dict[str, float]
class HospitalRequest(BaseModel):

    locality: str

    diseases: List[str]

    latitude: Optional[float] = None

    longitude: Optional[float] = None


def normalize_ocr_text(text):

    text = text.replace("\r", "\n")

    lines = []

    for line in text.splitlines():

        line = re.sub(r"[ \t]+", " ", line).strip()

        if line:
            lines.append(line)

    return "\n".join(lines)


def preprocess_image_for_ocr(image):

    image = ImageOps.exif_transpose(image)
    image = image.convert("L")

    max_side = max(image.size)

    if max_side < 1800:

        scale = 1800 / max_side

        image = image.resize(
            (
                int(image.width * scale),
                int(image.height * scale)
            ),
            Image.Resampling.LANCZOS
        )

    image = ImageOps.autocontrast(
        image,
        cutoff=1
    )

    image = ImageEnhance.Sharpness(image).enhance(1.6)

    thresholded = image.point(
        lambda pixel: 255 if pixel > 170 else 0,
        mode="1"
    ).convert("L")

    denoised = image.filter(
        ImageFilter.MedianFilter(size=3)
    )

    return [
        image,
        denoised,
        thresholded
    ]


def score_ocr_text(text):

    cleaned = normalize_ocr_text(text)

    if not cleaned:
        return 0

    hints = sum(
        1 for hint in OCR_MEDICAL_HINTS
        if hint in cleaned.lower()
    )

    numbers = len(
        re.findall(
            r"\d+(?:\.\d+)?",
            cleaned
        )
    )

    useful_lines = sum(
        1 for line in cleaned.splitlines()
        if re.search(r"[a-zA-Z]", line) and re.search(r"\d", line)
    )

    return (
        len(cleaned)
        + hints * 300
        + numbers * 20
        + useful_lines * 50
    )


def image_to_best_text(image):

    best_text = ""
    best_score = 0

    for prepared_image in preprocess_image_for_ocr(image):

        for config in OCR_CONFIGS:

            text = pytesseract.image_to_string(
                prepared_image,
                config=config
            )

            score = score_ocr_text(text)

            if score > best_score:

                best_score = score
                best_text = text

    return normalize_ocr_text(best_text)


def extract_text_from_file(file_path):

    text = ""

    try:

        if file_path.lower().endswith(".pdf"):

            pages = convert_from_path(
                    file_path,
                    dpi=350
                    )

            for page in pages:

                text += image_to_best_text(page)
                text += "\n"

        else:

            image = Image.open(file_path)

            text = image_to_best_text(image)

    except Exception as e:

        print("OCR Error:", e)

        return ""

    return normalize_ocr_text(text)


def extract_medical_parameters(text):
    regex_params = extract_parameters_regex(text)
    normalized_params = normalize_parameters(regex_params)
    return validate_with_groq(text, normalized_params)


def predict_from_parameters(params):
    results = []
    age = int(float(params.get("age") or 50))
    gender = params.get("gender", "Male")

    if params.get("glucose") is not None or params.get("bmi") is not None:
        results.append(predict_diabetes(params, age))

    if (
        params.get("cholesterol") is not None
        or params.get("cp") is not None
        or params.get("thalach") is not None
    ):
        results.append(predict_heart(params, age, gender))

    if params.get("creatinine") is not None or params.get("bloodUrea") is not None:
        results.append(predict_kidney(params, age))

    if (
        params.get("tsh") is not None
        or params.get("t3") is not None
        or params.get("tt4") is not None
    ):
        results.append(predict_thyroid(params, age, gender))

    if params.get("albumin") is not None or params.get("totalBilirubin") is not None:
        results.append(predict_liver(params, age, gender))

    return results
@app.get("/")
def home():
    return {
        "message": "TrustMedAI Running"
    }

@app.post("/predict")
def predict(request: PredictionRequest):

    params = request.parameters

    results = []

    if (
        params.get("glucose") is not None
        or params.get("bmi") is not None
    ):
        results.append(
            predict_diabetes(
                params,
                request.age
            )
        )

    if (
        params.get("cholesterol") is not None
        or params.get("cp") is not None
        or params.get("thalach") is not None
    ):
        results.append(
            predict_heart(
                params,
                request.age,
                request.gender
            )
        )

    if (
        params.get("totalBilirubin") is not None
        or params.get("albumin") is not None
    ):
        results.append(
            predict_liver(
                params,
                request.age,
                request.gender
            )
        )

    if (
        params.get("creatinine") is not None
        or params.get("bloodUrea") is not None
    ):
        results.append(
            predict_kidney(
                params,
                request.age
            )
        )

    if (
        params.get("tsh") is not None
        or params.get("t3") is not None
        or params.get("tt4") is not None
    ):
        results.append(
            predict_thyroid(
                params,
                request.age,
                request.gender
            )
        )

    return {
        "predictions": results
    }
@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):

    extension = os.path.splitext(
        file.filename
    )[1]

    if extension.lower() not in ALLOWED_EXTENSIONS:

        return {
            "success": False,
            "message": "Only JPG, JPEG, PNG and PDF files are supported."
        }

    temp_file = f"temp_{uuid.uuid4().hex}{extension}"

    contents = await file.read()

    with open(temp_file, "wb") as f:
        f.write(contents)

    text = extract_text_from_file(
        temp_file
    )
    if os.path.exists(temp_file):
        os.remove(temp_file)
    if not text:

        return {
            "success": False,
            "message": "Unable to read file."
        }

    if not is_medical_report(text):

        return {
            "success": False,
            "message": "Uploaded file is not a valid medical report."
        }

    regex_params = extract_parameters_regex(text)

    print("\n========== REGEX ==========")
    print(regex_params)

    normalized_params = normalize_parameters(regex_params)

    print("\n========== NORMALIZED ==========")
    print(normalized_params)

    params = validate_with_groq(
        text,
        normalized_params
    )

    print("\n========== FINAL ==========")
    print(params)


    return {
        "success": True,
        "rawText": text,
        "parameters": params
    }
@app.post("/ocr-predict")
async def ocr_predict(
    file: UploadFile = File(...),
):

    extension = os.path.splitext(
        file.filename
    )[1]

    if extension.lower() not in ALLOWED_EXTENSIONS:

        return {
            "success": False,
            "message": "Only JPG, JPEG, PNG and PDF files are supported."
        }

    temp_file = f"temp_{uuid.uuid4().hex}{extension}"

    contents = await file.read()

    with open(temp_file, "wb") as f:
        f.write(contents)

    text = extract_text_from_file(
        temp_file
    )
    if os.path.exists(temp_file):
        os.remove(temp_file)
    if not text:

        return {
            "success": False,
            "message": "Unable to read file."
        }

    if not is_medical_report(text):

        return {
            "success": False,
            "message": "Uploaded file is not a valid medical report."
        }

    regex_params = extract_parameters_regex(text)

    print("\n========== REGEX ==========")
    print(regex_params)

    normalized_params = normalize_parameters(regex_params)

    print("\n========== NORMALIZED ==========")
    print(normalized_params)

    params = validate_with_groq(
        text,
        normalized_params
    )

    print("\n========== FINAL ==========")
    print(params)


    results = []

    age = int(params.get("age") or 50)

    gender = params.get(
        "gender",
        "Male"
    )

    if params.get("glucose") is not None:

        results.append(
            predict_diabetes(
                params,
                age
            )
        )

    if params.get("cholesterol") is not None:

        results.append(
            predict_heart(
                params,
                age,
                gender
            )
        )
    if (
        params.get("creatinine") is not None
        or params.get("bloodUrea") is not None
    ):

        results.append(
            predict_kidney(
                params,
                age
            )
        )
    if params.get("tsh") is not None:

        results.append(
            predict_thyroid(
                params,
                age,
                gender
            )
        )

    if (
        params.get("albumin") is not None
        or params.get("totalBilirubin") is not None
    ):

        results.append(
            predict_liver(
                params,
                age,
                gender
            )
        )
    print("\n========== PREDICTIONS ==========")
    for prediction in results:
        print(prediction)
    return {

        "success": True,

        "rawText": text,

        "parameters": params,

        "predictions": results

    }


@app.post("/voice-predict")
async def voice_predict(file: UploadFile = File(...)):
    filename = file.filename or "voice-report.webm"
    extension = os.path.splitext(filename)[1].lower()

    if extension not in AUDIO_EXTENSIONS:
        return {
            "success": False,
            "message": "Only WEBM, WAV, MP3, M4A, MP4, MPEG and OGG audio files are supported.",
        }

    contents = await file.read()

    if not contents:
        return {"success": False, "message": "The audio recording is empty."}

    try:
        transcript = transcribe_audio(filename, contents)
    except Exception as error:
        print("Voice transcription error:", error)
        return {"success": False, "message": "Unable to transcribe the voice recording."}

    if not transcript:
        return {"success": False, "message": "No speech was detected in the recording."}

    params = extract_medical_parameters(transcript)

    if not params:
        return {
            "success": False,
            "message": "No medical parameters were found in the recording.",
            "transcript": transcript,
        }

    results = predict_from_parameters(params)

    return {
        "success": True,
        "source": "voice",
        "transcript": transcript,
        "rawText": transcript,
        "patient": {
            "patientName": params.get("patientName", "Voice Report Patient"),
            "age": params.get("age", 50),
            "gender": params.get("gender", "Male"),
        },
        "parameters": params,
        "predictions": results,
    }
def get_coordinates_from_locality(locality):

    url = (
        "https://places.googleapis.com/v1/"
        "places:searchText"
    )

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask":
            "places.location"
    }

    body = {
        "textQuery": locality
    }

    response = requests.post(
        url,
        headers=headers,
        json=body
    )

    data = response.json()

    print(data)

    places = data.get(
        "places",
        []
    )

    if not places:
        return None, None

    location = places[0]["location"]

    return (
        location["latitude"],
        location["longitude"]
    )
@app.post("/recommend-hospitals")
def recommend_hospitals(
    request: HospitalRequest
):
    print("Received Latitude:", request.latitude)
    print("Received Longitude:", request.longitude)
    print("Received Locality:", request.locality)
    if request.latitude and request.longitude:

        reference_lat = request.latitude
        reference_lon = request.longitude

    else:

        reference_lat, reference_lon = (
            get_coordinates_from_locality(
                request.locality
            )
        )

        if not reference_lat:

            return {
                "success": False,
                "message": "Unable to locate area"
            }
    url = (
        "https://places.googleapis.com/v1/"
        "places:searchText"
    )

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask":
            "places.displayName,"
            "places.rating,"
            "places.userRatingCount,"
            "places.businessStatus,"
            "places.formattedAddress,"
            "places.types,"
            "places.googleMapsUri,"
            "places.websiteUri,"
            "places.location"
    }

    body = {
        "textQuery":
            f"multispeciality hospitals in "
            f"{request.locality}"
    }
    required_specialists = list({
        DISEASE_SPECIALISTS[d]
        for d in request.diseases
        if d in DISEASE_SPECIALISTS
    })
    required_facilities = []
    for disease in request.diseases:

        required_facilities.extend(
            DISEASE_FACILITIES.get(
                disease,
                []
            )
        )

    required_facilities = list(
        set(required_facilities)
    )
    response = requests.post(
        url,
        headers=headers,
        json=body
    )

    if response.status_code != 200:
        return {
            "success": False,
            "message": "Unable to fetch hospitals"
        }

    data = response.json()
    print(data)
    places = data.get(
        "places",
        []
    )
    print("Places Found:", len(places))


    if not places:
        return {
            "success": False,
            "message": "No hospitals found"
        }

    hospitals = []

    for place in places:
        print(place)
        rating = place.get(
            "rating",
            4.0
        )

        user_rating_count = place.get(
            "userRatingCount",
            0
        )

        business_status = place.get(
            "businessStatus",
            ""
        )

        place_types = place.get(
            "types",
            []
        )
        website = place.get(
            "websiteUri",
            ""
        )
        hospital_lat = place.get(
            "location",
            {}
        ).get(
            "latitude",
            0
        )

        hospital_lon = place.get(
            "location",
            {}
        ).get(
            "longitude",
            0
        )
        available_specialists = []
        available_facilities = []

        if website:

            available_specialists = (
                extract_specialists(
                    website
                )
            )

            available_facilities = (
                extract_facilities(
                    website
                )
            )

        matched_specialists = [
            s
            for s in required_specialists
            if s in available_specialists
        ]

        specialist_match = (
            len(matched_specialists)
            /
            max(
                len(required_specialists),
                1
            )
        ) * 100

        matched_facilities = [
            f
            for f in required_facilities
            if f in available_facilities
        ]

        facility_match = (
            len(matched_facilities)
            /
            max(
                len(required_facilities),
                1
            )
        ) * 100
        distance_km = calculate_distance_km(
            reference_lat,
            reference_lon,
            hospital_lat,
            hospital_lon
        )

        distance_score = round(
            max(
                0,
                100 - (
                    distance_km * 3
                )
            ),
            2
        )

        rating_score = (
            rating / 5
        ) * 100

        hospital_reasons = []

        if rating >= 4.8:
            hospital_reasons.append(
                "Excellent Google Rating"
            )

        elif rating >= 4.5:
            hospital_reasons.append(
                "Highly Rated Hospital"
            )

        if user_rating_count > 1000:
            hospital_reasons.append(
                "Trusted By Thousands Of Patients"
            )

        elif user_rating_count > 100:
            hospital_reasons.append(
                "Well Reviewed Healthcare Facility"
            )

        if business_status == "OPERATIONAL":
            hospital_reasons.append(
                "Currently Operational"
            )
        hospital = {

            "name":
                place["displayName"]["text"],

            "address":
                place.get(
                    "formattedAddress",
                    ""
                ),

            "rating":
                rating,

            "userRatingCount":
                user_rating_count,

            "businessStatus":
                business_status,

            "googleMapsUri":
                place.get(
                    "googleMapsUri",
                    ""
                ),
                "websiteUri":
                    place.get(
                        "websiteUri",
                        ""
                    ),

            "hss":
                calculate_hss(
                    specialist_match,
                    facility_match,
                    distance_score,
                    rating_score
                ),

            "recommendationReasons":
                hospital_reasons,
            "availableSpecialists":
                available_specialists,

            "availableFacilities":
                available_facilities,

            "hssBreakdown": {

            "requiredSpecialists":
                required_specialists,

            "availableSpecialists":
                available_specialists,

            "matchedSpecialists":
                len(matched_specialists),

            "specialistMatch":
                round(
                    specialist_match,
                    2
                ),

            "requiredFacilities":
                required_facilities,

            "availableFacilities":
                available_facilities,

            "matchedFacilities":
                len(matched_facilities),

            "facilityMatch":
                round(
                    facility_match,
                    2
                ),
            "distanceKm":
                round(
                    distance_km,
                    2
                ),
            "distanceScore":
                distance_score,

            "ratingScore":
                round(
                    rating_score,
                    2
                )
        },
            
        }
        print(place)
        hospitals.append(
            hospital
        )

    hospitals.sort(
        key=lambda x:
            x["hss"],
        reverse=True
    )

    return {
        "hospitals":
            hospitals[:5]
    }

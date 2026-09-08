import requests
from bs4 import BeautifulSoup

SPECIALISTS = {
    "cardiology": "Cardiologist",
    "endocrinology": "Endocrinologist",
    "nephrology": "Nephrologist",
    "gastroenterology": "Gastroenterologist"
}

def extract_specialists(website_url):

    try:

        response = requests.get(
            website_url,
            headers={
                "User-Agent":
                "Mozilla/5.0"
            },
            timeout=15
        )

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        page_text = soup.get_text(
            separator=" "
        ).lower()

        found = []

        for keyword, specialist in SPECIALISTS.items():

            if keyword in page_text:

                found.append(
                    specialist
                )

        print("Found:", found)

        return list(
            set(found)
        )

    except Exception as e:

        print(
            "Scraping Error:",
            e
        )

        return []
FACILITIES = {
    "icu": "ICU",
    "mri": "MRI",
    "ct scan": "CT Scan",
    "laboratory": "Laboratory",
    "emergency": "Emergency",
    "dialysis": "Dialysis"
}

def extract_facilities(website_url):

    try:

        response = requests.get(
            website_url,
            headers={
                "User-Agent":
                "Mozilla/5.0"
            },
            timeout=15
        )

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        text = soup.get_text(
            separator=" "
        ).lower()

        found = []

        for keyword, facility in FACILITIES.items():

            if keyword in text:

                found.append(
                    facility
                )

        print("Facilities:", found)

        return list(set(found))

    except Exception as e:

        print("Error:", e)

        return []
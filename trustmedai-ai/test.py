from services.hospital_scraper import extract_facilities

print(
    extract_facilities(
        "https://www.yashodahospitals.com/locations/somajiguda/"
    )
)
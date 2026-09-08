import os

from groq import Groq


def transcribe_audio(filename, contents):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")

    transcription = Groq(api_key=api_key).audio.transcriptions.create(
        file=(filename, contents),
        model="whisper-large-v3-turbo",
        response_format="json",
        temperature=0,
    )

    return (transcription.text or "").strip()

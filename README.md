# TrustMedAI

TrustMedAI is a full-stack healthcare risk-analysis platform that combines multi-disease machine-learning predictions, medical-report OCR, voice input, longitudinal health trends, hospital recommendations, secure authentication, and optional Hyperledger Fabric report verification.

> TrustMedAI is an educational/research project. Its predictions are not medical diagnoses and must not replace evaluation by a qualified healthcare professional.

## Main capabilities

- Risk analysis for diabetes, heart, kidney, liver, and thyroid conditions
- Direct biomarker entry and medical-report upload
- OCR-assisted parameter extraction from images and PDFs
- Voice-report transcription and analysis
- Explainable prediction results and health-trend history
- Hospital matching based on condition, location, facilities, and specialists
- JWT authentication, OAuth login, password recovery, and Turnstile protection
- PDF reports with QR-based verification
- Optional Hyperledger Fabric proof anchoring
- Responsive web interface and Capacitor Android application

## Architecture

```text
Browser / Android app
        |
        v
Next.js frontend (test/)
        |
        v
Spring Boot API (backend/) --------> PostgreSQL
        |
        v
FastAPI inference service (trustmedai-ai/)
        |
        +----> ML models / OCR / transcription / hospital data
        |
        +----> Optional Hyperledger Fabric network
```

## Repository structure

| Directory | Purpose |
| --- | --- |
| `test/` | Next.js frontend and Capacitor Android project |
| `backend/` | Spring Boot REST API, authentication, persistence, PDF and audit services |
| `trustmedai-ai/` | FastAPI prediction, OCR, voice and hospital recommendation service |
| `fabric-network/` | Local Fabric scripts and report-proof chaincode |
| `media/` | Model-development scripts, datasets, and evaluation figures |
| `monitoring/` | Prometheus configuration |

## Prerequisites

- Node.js 20 or newer
- npm
- Java matching `backend/pom.xml` (currently Java 25)
- Python 3.11 or newer
- PostgreSQL
- Tesseract OCR, Poppler, and FFmpeg for the complete AI workflow
- Android Studio for Android builds
- Docker Desktop only when using the local Fabric network

## Environment configuration

Never commit real credentials. Copy the example files and fill in values locally:

```bash
cp test/.env.example test/.env.local
cp backend/.env.example backend/.env
cp trustmedai-ai/.env.example trustmedai-ai/.env
```

For Android development, create `test/.env.android`:

```env
NEXT_PUBLIC_API_BASE_URL=http://10.0.2.2:8080
```

Use `10.0.2.2` for the Android emulator. For a physical phone, use the computer's LAN address or, preferably, a deployed HTTPS API URL.

## Run locally

Start the services in this order.

### 1. AI service

```bash
cd trustmedai-ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The AI service is available at `http://localhost:8000` and its interactive API documentation at `http://localhost:8000/docs`.

### 2. Spring Boot API

```bash
cd backend
./mvnw spring-boot:run
```

The backend is available at `http://localhost:8080`. Its health endpoint is `http://localhost:8080/actuator/health`.

### 3. Next.js frontend

```bash
cd test
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

Frontend:

```bash
cd test
npm ci
npm run build
```

The frontend uses Next.js static export and writes deployable assets to `test/out`.

Backend:

```bash
cd backend
./mvnw clean package
```

AI service:

```bash
cd trustmedai-ai
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
```

## Android application

```bash
cd test
npm install
npm run android:sync
npm run android:open
```

Build and run the application from Android Studio after synchronization.

## Optional local Fabric ledger

Start Docker Desktop, then run:

```bash
cd fabric-network
./start-local-network.sh
```

Set `FABRIC_ENABLED=true` in `backend/.env` only after the network starts successfully. Stop it with:

```bash
./stop-local-network.sh
```

Only report-proof metadata should be written to the ledger; medical reports and patient data remain in PostgreSQL.

## Deployment

The recommended deployment topology is:

- Frontend: Cloudflare Pages
- Spring Boot API: a Docker-capable service such as Render
- FastAPI inference: Render or another container service with enough memory for ML/OCR dependencies
- Database: managed PostgreSQL such as Neon

Cloudflare Pages frontend settings:

```text
Root directory: test
Build command: npm run build
Output directory: out
```

Production frontend environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.example
```

Before production deployment, replace every remaining `localhost` reference in backend integration URLs with environment-based frontend and AI service URLs. Configure the production frontend hostname in CORS, OAuth redirect URIs, and Cloudflare Turnstile.

## Security

- Keep `.env`, signing keys, database credentials, OAuth secrets, and API keys out of Git.
- Use separate credentials for development and production.
- Rotate any credential that has previously appeared in source code or logs.
- Use HTTPS for web and Android production traffic.
- Keep `FABRIC_ENABLED=false` unless a correctly secured Fabric network is available.
- Review the system for applicable healthcare privacy, consent, retention, and security requirements before handling real patient data.

## License

No open-source license has been selected yet. Until one is added, all rights are reserved by the repository owner.

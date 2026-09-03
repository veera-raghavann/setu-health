# Running PRISM locally

## What starts

```text
PostgreSQL
    +
PRISM OCR Worker (OpenCV + PaddleOCR)
    +
PRISM API
```

## Prerequisites

- Docker Desktop running
- Node.js 22 recommended for the web app

## Start backend stack

```bash
docker compose up --build
```

The first OCR build downloads Python/Paddle dependencies and may take several minutes.

If you previously built an older OCR image and see a native-library error such as `libGL.so.1`, pull the latest PRISM branch and rebuild the OCR service without cache:

```bash
git pull origin PRISM-001
docker compose build --no-cache prism-ocr
docker compose up
```

## Start patient web

In another terminal:

```bash
npm install
npm run dev:web
```

Create `apps/patient/.env.local`:

```text
VITE_PRISM_API_URL=http://localhost:8000
```

Open the Vite URL, normally `http://localhost:5173`.

## Health checks

- API: `http://localhost:8000/health`
- OCR: `http://localhost:8100/health`

## Production boundary

Docker Compose is our local integration environment. Production deployment still requires managed persistence, object storage, secret management, TLS, identity/consent enforcement, and approved external integrations.

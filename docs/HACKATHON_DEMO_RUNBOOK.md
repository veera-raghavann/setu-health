# SETU Internal Hackathon Demo Runbook

## Goal
Demonstrate one complete vertical slice:
1. Patient starts with a current health concern.
2. Patient answers adaptive PRISM questions through text, touch, or voice.
3. English, Tamil, and Hindi can be selected.
4. Voice works with BHASHINI when credentials are available and otherwise uses the browser speech fallback for the demo.
5. Patient uploads a medical record.
6. The original file remains accessible after OCR processing.
7. The UI explains that extracted information remains traceable to its source.

## Start infrastructure
```powershell
docker compose up --build
```

Verify:
- API: http://localhost:8000/health
- OCR: http://localhost:8100/health

## Start patient web app
Open a second terminal:
```powershell
npm install
npm run dev:web
```

Open the Vite URL shown in the terminal (normally http://localhost:5173).

## Demo script
1. Choose Tamil, Hindi, or English.
2. Click **I have a health concern**.
3. Describe a complaint.
4. Demonstrate touch options or the microphone.
5. Explain that PRISM keeps one conversation state independent of input modality.
6. Upload a sample prescription/report.
7. Open the original source resource from the record list.
8. Show the ABHA page and explain provenance categories.

## Important demo truth
- BHASHINI API access has been requested and is pending provider approval.
- The BHASHINI adapter remains in the architecture.
- The browser speech fallback exists only so the end-to-end workflow remains demonstrable before credentials are issued.
- PRISM is structured intake, not diagnosis or emergency-care replacement.

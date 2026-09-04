# MedBridge web client

Standalone MedBridge interface migrated from the Base44 prototype into the SETU monorepo. It talks to the shared SETU API rather than Base44 SDK services.

## Run

```bash
npm install
npm --workspace @setu/medbridge-web run dev
```

Set `VITE_SETU_API_URL=http://localhost:8000` when the API is running on the default development port.

# MedBridge + SETU shared patient pool

## Demo architecture

```
Patient mobile
   │
   ▼
ABHA-style OTP identity flow
   │
   ▼
Shared SETU patient pool
   ├── identity and profile
   ├── PRISM current health issues
   ├── patient-sided records
   ├── OCR/evidence references
   └── hospital-linked demo records
              │
              ▼
      MedBridge consent request
              │
        patient consent OTP
              │
              ▼
       30-minute access session
              │
              ▼
     reconciliation + clinician review
```

## Important demo boundary

The hospital-linked records are retained intentionally for the demonstration. They must be presented as seeded demonstration records representing records that could be returned by hospitals linked to the patient's ABHA identity. They are not real production ABHA/ABDM records.

## Data ownership

Patient-sided information remains distinguishable from source-linked information. MedBridge receives only the minimum context required after consent. PRISM and MedBridge therefore operate on one patient identity without collapsing provenance.

## Production boundary

Actual ABDM/ABHA connectivity, identity verification, HIP/HIU consent artefacts and production health-information exchange require approved credentials, specifications and compliance onboarding. The current implementation is a hackathon/demo adapter and must not be represented as a certified production integration.

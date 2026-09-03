# MedBridge Evidence Contract for PRISM Resources

Every PRISM-originated item exposed to MedBridge must retain:

- resource_id
- original_resource_id
- processed_resource_id when applicable
- source_type
- verification_status
- care_pathway
- source locator
- patient ownership reference

## Split-view requirement

When MedBridge presents an OCR-derived clinical item, the doctor should be able to:

1. Read the structured extraction.
2. Open the processed document.
3. Open the original patient-uploaded resource when needed.
4. See page/region provenance.

## AI requirement

No AI-generated MedBridge conclusion may cite an OCR extraction without retaining the originating PRISM resource reference.
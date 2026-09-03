from src.models import Evidence
from src.structurer import ClinicalStructurer

def test_ocr_entity_retains_document_resource_origin():
    text = "Rx\nMetformin 500 mg BD"
    evidence = [
        Evidence(
            text="Metformin 500 mg BD",
            confidence=0.9,
            resource_refs=[],
        )
    ]
    result = ClinicalStructurer().structure("document-123", text, evidence)
    assert result.source_class == "patient_provided_document"
    assert result.verification.state == "extracted_from_document"
    assert result.resource_refs[0].resource_id == "document-123"

def test_ayush_document_pathway_is_preserved():
    text = "Ayurvedic OPD\nPrakriti assessment\nPredominantly Vata"
    result = ClinicalStructurer().structure("document-ayush", text, [])
    assert result.clinical_pathway == "ayush"
    assert result.source_class == "patient_provided_document"

# PRISM-005 contract regression coverage.

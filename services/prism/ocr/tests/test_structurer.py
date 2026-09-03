from src.models import Evidence
from src.structurer import ClinicalStructurer

def test_prescription_classification_and_extraction():
    text = "Rx\nMetformin 500 mg BD\nAspirin 75 mg OD"
    evidence = [Evidence(text=line, confidence=0.9) for line in text.splitlines()]
    result = ClinicalStructurer().structure("demo", text, evidence)
    assert result.document_type == "prescription"
    assert len(result.medications) >= 1
    assert result.review_required is True

def test_lab_classification():
    text = "HbA1c: 8.2 %\nReference Range: 4.0-5.6"
    result = ClinicalStructurer().structure("lab", text, [])
    assert result.document_type == "lab_report"
    assert len(result.lab_observations) >= 1

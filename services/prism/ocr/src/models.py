from typing import Any, Literal
from pydantic import BaseModel, Field

DocumentType = Literal["prescription","lab_report","discharge_summary","opd_record","diagnostic_report","radiology_report","surgical_record","referral_letter","unknown"]

class Evidence(BaseModel):
    page: int = 1
    text: str
    confidence: float | None = None
    bbox: list[list[float]] | None = None

class ClinicalEntity(BaseModel):
    value: str
    confidence: float | None = None
    evidence: list[Evidence] = Field(default_factory=list)

class Medication(BaseModel):
    name: str
    dose: str | None = None
    frequency: str | None = None
    route: str | None = None
    confidence: float | None = None
    evidence: list[Evidence] = Field(default_factory=list)

class LabObservation(BaseModel):
    name: str
    value: str
    unit: str | None = None
    reference_range: str | None = None
    confidence: float | None = None
    evidence: list[Evidence] = Field(default_factory=list)

class StructuredClinicalDocument(BaseModel):
    document_id: str
    document_type: DocumentType = "unknown"
    language_hint: str | None = None
    raw_text: str
    diagnoses: list[ClinicalEntity] = Field(default_factory=list)
    medications: list[Medication] = Field(default_factory=list)
    lab_observations: list[LabObservation] = Field(default_factory=list)
    procedures: list[ClinicalEntity] = Field(default_factory=list)
    dates: list[ClinicalEntity] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)
    review_required: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)

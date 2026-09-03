from typing import Any, Literal
from pydantic import BaseModel, Field

DocumentType = Literal["prescription","lab_report","discharge_summary","opd_record","diagnostic_report","radiology_report","surgical_record","referral_letter","unknown"]
ClinicalPathway = Literal["allopathic","ayush","cross_cutting","unknown"]
SourceClass = Literal["patient_reported","patient_provided_document","abdm_exchange","clinician_confirmed","system_derived","unknown"]
VerificationState = Literal["unverified","patient_reported","extracted_from_document","abdm_exchange","clinician_confirmed","system_derived","unknown"]

class ResourceReference(BaseModel):
    resource_type: Literal["conversation_turn","touch_response","document","fhir_resource","clinician_review","system_process"]
    resource_id: str
    reference: str | None = None
    page: int | None = None
    section: str | None = None
    locator: str | None = None
    bbox: list[list[float]] | None = None

class Verification(BaseModel):
    state: VerificationState
    note: str | None = None

class Evidence(BaseModel):
    page: int = 1
    text: str
    confidence: float | None = None
    bbox: list[list[float]] | None = None
    resource_refs: list[ResourceReference] = Field(default_factory=list)

class ClinicalEntity(BaseModel):
    value: str
    clinical_pathway: ClinicalPathway = "unknown"
    source_class: SourceClass = "patient_provided_document"
    verification: Verification = Field(default_factory=lambda: Verification(state="extracted_from_document"))
    confidence: float | None = None
    evidence: list[Evidence] = Field(default_factory=list)

class Medication(BaseModel):
    name: str
    dose: str | None = None
    frequency: str | None = None
    route: str | None = None
    clinical_pathway: ClinicalPathway = "cross_cutting"
    source_class: SourceClass = "patient_provided_document"
    verification: Verification = Field(default_factory=lambda: Verification(state="extracted_from_document"))
    confidence: float | None = None
    evidence: list[Evidence] = Field(default_factory=list)

class LabObservation(BaseModel):
    name: str
    value: str
    unit: str | None = None
    reference_range: str | None = None
    clinical_pathway: ClinicalPathway = "allopathic"
    source_class: SourceClass = "patient_provided_document"
    verification: Verification = Field(default_factory=lambda: Verification(state="extracted_from_document"))
    confidence: float | None = None
    evidence: list[Evidence] = Field(default_factory=list)

class StructuredClinicalDocument(BaseModel):
    document_id: str
    document_type: DocumentType = "unknown"
    clinical_pathway: ClinicalPathway = "unknown"
    source_class: SourceClass = "patient_provided_document"
    verification: Verification = Field(default_factory=lambda: Verification(state="extracted_from_document"))
    resource_refs: list[ResourceReference] = Field(default_factory=list)
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

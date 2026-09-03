from abc import ABC, abstractmethod
from .models import StructuredClinicalDocument

class ClinicalStructuringAdapter(ABC):
    """Provider-neutral boundary for schema-constrained clinical extraction."""

    @abstractmethod
    def structure(self, raw_text: str, document_id: str) -> StructuredClinicalDocument:
        raise NotImplementedError

class DisabledLLMAdapter(ClinicalStructuringAdapter):
    def structure(self, raw_text: str, document_id: str) -> StructuredClinicalDocument:
        raise RuntimeError("LLM structuring is disabled. Configure an approved provider before enabling.")

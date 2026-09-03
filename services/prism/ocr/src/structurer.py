import re
from .models import ClinicalEntity, DocumentType, Evidence, LabObservation, Medication, StructuredClinicalDocument

class ClinicalStructurer:
    """
    Adapter boundary for the LLM clinical structuring layer.

    The MVP uses deterministic extraction as a safe baseline. An LLM adapter
    should augment this only when it can return schema-constrained JSON with
    evidence links.
    """

    def classify(self, text: str) -> DocumentType:
        lower = text.lower()
        if any(token in lower for token in ("rx", "prescription", "tab.", "tablet")):
            return "prescription"
        if any(token in lower for token in ("reference range", "specimen", "hemoglobin", "hba1c")):
            return "lab_report"
        if "discharge summary" in lower:
            return "discharge_summary"
        if any(token in lower for token in ("opd", "outpatient")):
            return "opd_record"
        return "unknown"

    def structure(self, document_id, raw_text, evidence):
        return StructuredClinicalDocument(
            document_id=document_id,
            document_type=self.classify(raw_text),
            raw_text=raw_text,
            medications=self._extract_medications(raw_text, evidence),
            lab_observations=self._extract_labs(raw_text, evidence),
            dates=self._extract_dates(raw_text, evidence),
            evidence=evidence,
            review_required=True,
            metadata={"structuring_mode":"baseline-deterministic","llm_adapter":"not-yet-configured"},
        )

    @staticmethod
    def _matching(value, evidence):
        needle = value.lower()
        return [item for item in evidence if needle in item.text.lower()][:3]

    def _extract_medications(self, text, evidence):
        pattern = re.compile(r"(?im)^\s*(?:tab\.?|tablet|cap\.?|capsule|syrup)?\s*([A-Z][A-Za-z0-9+\-/ ]{2,50})\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml))(?:\s+([A-Za-z0-9/×x.-]+))?")
        output = []
        for match in pattern.finditer(text):
            output.append(Medication(
                name=match.group(1).strip(),
                dose=match.group(2).strip(),
                frequency=match.group(3).strip() if match.group(3) else None,
                evidence=self._matching(match.group(0), evidence),
            ))
        return output

    def _extract_labs(self, text, evidence):
        pattern = re.compile(r"(?im)^\s*([A-Za-z][A-Za-z0-9 ()/%+-]{2,60})\s*[:=-]\s*([0-9]+(?:\.[0-9]+)?)\s*([A-Za-z/%µ]+)?")
        output = []
        for match in pattern.finditer(text):
            name, value, unit = match.groups()
            output.append(LabObservation(name=name.strip(), value=value, unit=unit, evidence=self._matching(match.group(0), evidence)))
        return output

    def _extract_dates(self, text, evidence):
        values = []
        for value in dict.fromkeys(re.findall(r"\b(?:\d{1,2}[/-]){2}\d{2,4}\b", text)):
            values.append(ClinicalEntity(value=value, evidence=self._matching(value, evidence)))
        return values

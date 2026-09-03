import re
from .models import ClinicalEntity, DocumentType, Evidence, LabObservation, Medication, ResourceReference, StructuredClinicalDocument, Verification

class ClinicalStructurer:
    """
    Adapter boundary for the LLM clinical structuring layer.

    The MVP uses deterministic extraction as a safe baseline. An LLM adapter
    may augment this only when it returns schema-constrained JSON and preserves
    resource-level evidence links for every material extracted claim.
    """

    AYUSH_TOKENS = (
        "ayurveda", "ayurvedic", "ayush", "prakriti", "vikriti",
        "agni", "koshtha", "ahara", "vihara", "dosha", "vata",
        "pitta", "kapha", "dashavidha", "ashtavidha", "trividha",
    )

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

    def infer_pathway(self, text: str) -> str:
        lower = text.lower()
        if any(token in lower for token in self.AYUSH_TOKENS):
            return "ayush"
        return "unknown"

    def structure(self, document_id, raw_text, evidence):
        pathway = self.infer_pathway(raw_text)
        self._ensure_document_refs(document_id, evidence)
        document_ref = ResourceReference(
            resource_type="document",
            resource_id=document_id,
            reference=f"Document/{document_id}",
        )
        return StructuredClinicalDocument(
            document_id=document_id,
            document_type=self.classify(raw_text),
            clinical_pathway=pathway,
            source_class="patient_provided_document",
            verification=Verification(state="extracted_from_document"),
            resource_refs=[document_ref],
            raw_text=raw_text,
            medications=self._extract_medications(raw_text, evidence, pathway),
            lab_observations=self._extract_labs(raw_text, evidence, pathway),
            dates=self._extract_dates(raw_text, evidence, pathway),
            evidence=evidence,
            review_required=True,
            metadata={
                "structuring_mode":"baseline-deterministic",
                "llm_adapter":"not-yet-configured",
                "pathway_inference":"keyword-baseline",
            },
        )

    @staticmethod
    def _ensure_document_refs(document_id, evidence):
        for index, item in enumerate(evidence, start=1):
            if not item.resource_refs:
                item.resource_refs = [ResourceReference(
                    resource_type="document",
                    resource_id=document_id,
                    reference=f"Document/{document_id}",
                    page=item.page,
                    locator=f"page-{item.page}/ocr-line-{index}",
                    bbox=item.bbox,
                )]

    @staticmethod
    def _matching(value, evidence):
        needle = value.lower()
        matches = [item for item in evidence if needle in item.text.lower()]
        if matches:
            return matches[:3]
        return evidence[:1]

    def _extract_medications(self, text, evidence, pathway):
        pattern = re.compile(r"(?im)^\s*(?:tab\.?|tablet|cap\.?|capsule|syrup)?\s*([A-Z][A-Za-z0-9+\-/ ]{2,50})\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml))(?:\s+([A-Za-z0-9/×x.-]+))?")
        output = []
        for match in pattern.finditer(text):
            output.append(Medication(
                name=match.group(1).strip(),
                dose=match.group(2).strip(),
                frequency=match.group(3).strip() if match.group(3) else None,
                clinical_pathway="cross_cutting" if pathway == "unknown" else pathway,
                evidence=self._matching(match.group(0), evidence),
            ))
        return output

    def _extract_labs(self, text, evidence, pathway):
        pattern = re.compile(r"(?im)^\s*([A-Za-z][A-Za-z0-9 ()/%+-]{2,60})\s*[:=-]\s*([0-9]+(?:\.[0-9]+)?)\s*([A-Za-z/%µ]+)?")
        output = []
        for match in pattern.finditer(text):
            name, value, unit = match.groups()
            output.append(LabObservation(
                name=name.strip(),
                value=value,
                unit=unit,
                clinical_pathway="allopathic" if pathway == "unknown" else pathway,
                evidence=self._matching(match.group(0), evidence),
            ))
        return output

    def _extract_dates(self, text, evidence, pathway):
        values = []
        for value in dict.fromkeys(re.findall(r"\b(?:\d{1,2}[/-]){2}\d{2,4}\b", text)):
            values.append(ClinicalEntity(
                value=value,
                clinical_pathway=pathway,
                evidence=self._matching(value, evidence),
            ))
        return values

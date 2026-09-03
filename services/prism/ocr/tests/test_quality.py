import numpy as np
from src.quality import assess_image_quality

def test_quality_returns_expected_contract():
    image = np.zeros((100, 100, 3), dtype=np.uint8)
    result = assess_image_quality(image)
    assert "issues" in result
    assert "review_recommended" in result

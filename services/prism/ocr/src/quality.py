import cv2
import numpy as np

def assess_image_quality(image: np.ndarray) -> dict:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    contrast = float(gray.std())
    brightness = float(gray.mean())
    issues = []
    if blur < 40:
        issues.append("possibly_blurry")
    if contrast < 20:
        issues.append("low_contrast")
    if brightness < 35:
        issues.append("too_dark")
    if brightness > 235:
        issues.append("overexposed")
    return {
        "blur_score": round(blur, 2),
        "contrast_score": round(contrast, 2),
        "brightness_score": round(brightness, 2),
        "issues": issues,
        "review_recommended": bool(issues),
    }

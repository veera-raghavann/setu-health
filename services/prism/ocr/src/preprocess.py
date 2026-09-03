import cv2
import numpy as np

class OpenCVPreprocessor:
    """Conservative preprocessing. Original bytes are never overwritten."""

    def run(self, image_bytes: bytes) -> np.ndarray:
        image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Unable to decode uploaded image.")
        return self.run_image(image)

    def run_image(self, image: np.ndarray) -> np.ndarray:
        image = self._resize(image)
        image = self._deskew(image)
        return self._enhance(image)

    @staticmethod
    def _resize(image, max_width=2200):
        h, w = image.shape[:2]
        if w <= max_width:
            return image
        scale = max_width / w
        return cv2.resize(image, (int(w * scale), int(h * scale)))

    @staticmethod
    def _deskew(image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        points = np.column_stack(np.where(binary > 0))
        if len(points) < 100:
            return image
        angle = cv2.minAreaRect(points)[-1]
        angle = -(90 + angle) if angle < -45 else -angle
        if abs(angle) > 15:
            return image
        h, w = image.shape[:2]
        matrix = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
        return cv2.warpAffine(image, matrix, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    @staticmethod
    def _enhance(image):
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        return cv2.cvtColor(cv2.merge((clahe.apply(l), a, b)), cv2.COLOR_LAB2BGR)

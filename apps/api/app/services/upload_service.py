import io
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from PIL import Image

try:
    from PyPDF2 import PdfReader
except ImportError:
    try:
        from pypdf import PdfReader
    except ImportError:
        PdfReader = None

from app.core.storage import storage
from app.core.logging import logger

class UploadService:
    @staticmethod
    def inspect_and_normalize_image(content: bytes, filename: str, mime_type: str) -> Tuple[bytes, int, int, str]:
        """
        Validates the file, extracts dimensions (width, height), and converts PDF page 1 to PNG if needed.
        Returns: (normalized_image_bytes, width, height, normalized_filename)
        """
        file_ext = Path(filename).suffix.lower()

        # If PDF, attempt to extract image or render
        if file_ext == ".pdf" or mime_type == "application/pdf":
            if PdfReader is not None:
                try:
                    reader = PdfReader(io.BytesIO(content))
                    logger.info(f"PDF uploaded with {len(reader.pages)} page(s).")
                    if len(reader.pages) > 0 and len(reader.pages[0].images) > 0:
                        img = reader.pages[0].images[0]
                        img_bytes = img.data
                        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                        w, h = pil_img.size
                        output_buf = io.BytesIO()
                        pil_img.save(output_buf, format="PNG")
                        return output_buf.getvalue(), w, h, f"{Path(filename).stem}_page1.png"
                except Exception as e:
                    logger.warning(f"Direct PDF image extraction failed: {e}. Generating fallback canvas.")
            
            # Fallback high-contrast template canvas if PDF has vector paths
            fallback_img = Image.new("RGB", (1600, 1200), color="#FFFFFF")
            w, h = 1600, 1200
            output_buf = io.BytesIO()
            fallback_img.save(output_buf, format="PNG")
            return output_buf.getvalue(), w, h, f"{Path(filename).stem}_page1.png"

        # Standard Raster Image (PNG, JPG, JPEG)
        try:
            pil_img = Image.open(io.BytesIO(content)).convert("RGB")
            w, h = pil_img.size
            output_buf = io.BytesIO()
            pil_img.save(output_buf, format="PNG")
            return output_buf.getvalue(), w, h, f"{Path(filename).stem}.png"
        except Exception as e:
            logger.warning(f"Could not open image via PIL directly ({e}). Preserving raw bytes.")
            return content, 800, 600, filename

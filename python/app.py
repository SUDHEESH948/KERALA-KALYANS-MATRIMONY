import base64
import os
import re
from functools import lru_cache
from threading import Lock

import cv2
import easyocr
import numpy as np
import torch
from flask import Flask, jsonify, request
from PIL import Image, ImageOps
from werkzeug.exceptions import BadRequest, RequestEntityTooLarge


MAX_UPLOAD_BYTES = 1_000_000
MAX_IMAGE_PIXELS = 16_000_000
MAX_PHOTO_BYTES = 1_000_000
MAX_OCR_EDGE = 1600

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES + 64 * 1024
ocr_lock = Lock()


@lru_cache(maxsize=1)
def load_ocr():
    # A small thread pool avoids CPU contention during single-card inference.
    torch.set_num_threads(min(4, torch.get_num_threads()))
    return easyocr.Reader(["en"], gpu=False)


def preprocess_image(image):
    img = np.asarray(image)
    w = image.width
    # Extract right-side text area
    text_area = img[:, int(w * 0.36):]
    gray = cv2.cvtColor(
        text_area,
        cv2.COLOR_RGB2GRAY
    )
    # Enlarge small cards for readability and bound work on large scans.
    height, width = gray.shape
    scale = min(2, MAX_OCR_EDGE / max(height, width))
    if scale != 1:
        gray = cv2.resize(
            gray,
            (max(1, round(width * scale)), max(1, round(height * scale))),
            interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC,
        )
    # Improve contrast
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )
    enhanced = clahe.apply(gray)
    return enhanced
def merge_ocr_lines(results):
    boxes = []
    for bbox, text, confidence in results:
        x_min = min(point[0] for point in bbox)
        y_min = min(point[1] for point in bbox)
        y_max = max(point[1] for point in bbox)
        boxes.append({
            "x": x_min,
            "y": (y_min + y_max) / 2,
            "height": y_max - y_min,
            "text": text,
            "confidence": float(confidence)
        })
    if not boxes:
        return []
    boxes.sort(key=lambda item: item["y"])
    median_height = np.median(
        [box["height"] for box in boxes]
    )
    tolerance = max(8, median_height * 0.55)
    rows = []
    for box in boxes:
        matched = False
        for row in rows:
            if abs(row["y"] - box["y"]) <= tolerance:
                row["items"].append(box)
                row["y"] = np.mean([
                    item["y"]
                    for item in row["items"]
                ])
                matched = True
                break
        if not matched:
            rows.append({
                "y": box["y"],
                "items": [box]
            })
    rows.sort(key=lambda row: row["y"])
    lines = []
    for row in rows:
        row["items"].sort(
            key=lambda item: item["x"]
        )
        line = " ".join(
            item["text"]
            for item in row["items"]
        )
        lines.append(line.strip())
    return lines
PATTERNS = {
    "father_name": (
        r"^(?:father'?s?\s*name|father)\b"
    ),
    "name": (
        r"^(?:names?|candidate\s*name)\b"
    ),
    "age": (
        r"^age\b"
    ),
    "star": (
        r"^(?:star|birth\s*star|nakshatra)\b"
    ),
    "education": (
        r"^(?:education|qualification|edu)\b"
    ),
    "height": (
        r"^(?:height|hight|heigth)\b"
    ),
    "caste": (
        r"^(?:caste|cast|community)\b"
    ),
    "contact": (
        r"^(?:contact|phone|mobile|condact)\b"
        r"(?:\s+(?:number|no)\b\.?)?"
    ),
    "district": (
        r"^(?:place\s*[/\\-]\s*district"
        r"|district|place|location)\b"
    )
}
DISTRICT_MAP = {
    "malapuram": "Malappuram",
    "malappuram": "Malappuram",
    "calicut": "Kozhikode",
    "kozhikode": "Kozhikode",
    "trivandrum": "Thiruvananthapuram",
    "thiruvananthapuram": "Thiruvananthapuram",
    "trichur": "Thrissur",
    "thrissur": "Thrissur",
    "palghat": "Palakkad",
    "palakkad": "Palakkad",
    "alleppey": "Alappuzha",
    "alappuzha": "Alappuzha",
    "cannanore": "Kannur",
    "kannur": "Kannur",
    "kasargod": "Kasaragod",
    "kasaragod": "Kasaragod",
    "wayanad": "Wayanad",
    "ernakulam": "Ernakulam",
    "kottayam": "Kottayam",
    "idukki": "Idukki",
    "kollam": "Kollam",
    "pathanamthitta": "Pathanamthitta"
}
def normalize_district(value):
    value = value.strip(" :;,/-*")
    return DISTRICT_MAP.get(
        value.lower(),
        value.title()
    )
def clean_value(key, value):
    value = value.strip(" :;,/-*|")
    value = re.sub(r"\s+", " ", value)
    if key == "age":
        match = re.search(r"\d{1,3}", value)
        if match:
            age = int(match.group())
            if 18 <= age <= 100:
                return str(age)
        return ""
    elif key == "height":
        match = re.fullmatch(
            r"(\d{2,3}(?:\.\d+)?)\s*(?:cm)?",
            value,
            re.IGNORECASE
        )
        if match:
            height = float(match.group(1))
            if 100 <= height <= 250:
                return f"{height:g} CM"
        return value
    elif key == "contact":
        return value.strip()
    elif key == "district":
        return normalize_district(value)
    elif key == "education":
        value = re.sub(
            r"\s*\.\s*",
            ".",
            value
        )
        return value.upper()
    elif key in [
        "name",
        "father_name",
        "star",
        "caste"
    ]:
        return value.title()
    return value
def extract_details(image):
    reader = load_ocr()
    processed = preprocess_image(image)
    results = reader.readtext(
        processed,
        detail=1,
        paragraph=False,
        decoder="greedy",
        text_threshold=0.6,
        low_text=0.3
    )
    lines = merge_ocr_lines(results)
    data = {
        key: ""
        for key in PATTERNS
    }
    def is_label(text):
        return any(
            re.match(
                pattern,
                text,
                re.IGNORECASE
            )
            for pattern in PATTERNS.values()
        )
    for i, line in enumerate(lines):
        line = line.strip()
        for key, pattern in PATTERNS.items():
            match = re.match(
                pattern,
                line,
                re.IGNORECASE
            )
            if not match:
                continue
            if data[key]:
                break
            value = line[match.end():]
            value = value.strip(" :;,/-*|")
            # Handle label and value on separate lines
            if not value and i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if not is_label(next_line):
                    value = next_line
            data[key] = clean_value(
                key,
                value
            )
            break
    return data


def encode_profile_photo(image):
    pixels = np.asarray(image)
    width, height = image.size
    # Use the portrait region from the existing card template.
    photo = pixels[int(height * .32):max(1, int(height * .73)),
                   :max(1, int(width * .30))]
    photo = cv2.cvtColor(photo, cv2.COLOR_RGB2BGR)
    scale = min(1, 1600 / max(photo.shape[:2]))
    if scale < 1:
        photo = cv2.resize(
            photo,
            (max(1, int(photo.shape[1] * scale)), max(1, int(photo.shape[0] * scale))),
            interpolation=cv2.INTER_AREA,
        )

    for quality in range(95, 34, -5):
        encoded, buffer = cv2.imencode(".jpg", photo, [cv2.IMWRITE_JPEG_QUALITY, quality])
        if encoded and buffer.nbytes <= MAX_PHOTO_BYTES:
            return base64.b64encode(buffer.tobytes()).decode("ascii")
    raise ValueError("Unable to encode the cropped photo within 1 MB.")


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.errorhandler(RequestEntityTooLarge)
def upload_too_large(_error):
    return jsonify(error="Maximum image upload size is 1 MB."), 413


@app.errorhandler(BadRequest)
def invalid_request(_error):
    return jsonify(error="Invalid multipart upload."), 400


@app.post("/extract")
def extract():
    if request.mimetype != "multipart/form-data":
        return jsonify(error="Send a multipart/form-data request with an image field."), 415

    images = request.files.getlist("image")
    if len(images) != 1 or not images[0].filename:
        return jsonify(error="Upload exactly one file in the image field."), 400

    stream = images[0].stream
    stream.seek(0, os.SEEK_END)
    size = stream.tell()
    stream.seek(0)
    if size > MAX_UPLOAD_BYTES:
        return upload_too_large(None)

    try:
        with Image.open(stream) as source:
            if source.format not in {"JPEG", "PNG"}:
                return jsonify(error="Upload a JPEG or PNG image."), 415
            if source.width * source.height > MAX_IMAGE_PIXELS:
                return jsonify(error="Maximum image resolution is 16 megapixels."), 413
            image = ImageOps.exif_transpose(source).convert("RGB")
    except Image.DecompressionBombError:
        return jsonify(error="Maximum image resolution is 16 megapixels."), 413
    except (OSError, SyntaxError, ValueError):
        return jsonify(error="Invalid or unreadable image."), 400

    try:
        photo = encode_profile_photo(image)
        # Share one reader per process and serialize inference on it.
        with ocr_lock:
            data = extract_details(image)
    except Exception:
        app.logger.error("Matrimony card OCR or photo encoding failed.")
        return jsonify(error="Unable to process the image."), 500

    return jsonify(
        data=data,
        photo={"mimeType": "image/jpeg", "base64": photo},
        missingFields=[key for key, value in data.items() if not value],
    )


if __name__ == "__main__":
    app.run(
        host=os.environ.get("OCR_HOST", "127.0.0.1"),
        port=int(os.environ.get("OCR_PORT", "5001")),
    )

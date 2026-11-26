FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    EASYOCR_MODULE_PATH=/opt/easyocr
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch torchvision \
    && pip install --no-cache-dir -r requirements.txt "gunicorn>=23,<26"

COPY app.py .
RUN python -c "from app import load_ocr; load_ocr()"

EXPOSE 5001
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "1", "--threads", "2", "--timeout", "130", "app:app"]

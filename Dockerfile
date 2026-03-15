FROM python:3.10-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r chemistry_ai_platform/requirements.txt

EXPOSE 8000

CMD ["uvicorn", "chemistry_ai_platform.backend.app:app", "--host", "0.0.0.0", "--port", "8000"]

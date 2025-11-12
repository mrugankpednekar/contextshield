FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml ./
RUN pip install -U pip && \
    pip install fastapi uvicorn[standard] httpx python-dotenv pydantic sqlalchemy psycopg[binary] python-multipart presidio-analyzer presidio-anonymizer pyyaml
COPY . .
EXPOSE 8000
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]

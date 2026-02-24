# c:\finalyearproject\career-roadmap-app\backend\service\Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies (needed for mysqlclient, psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
# Add gunicorn to requirements if not present, but for now we rely on existing ones
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy application source
COPY . .

# Expose port for Flask
EXPOSE 5001

# Start command with production config
CMD ["gunicorn", "-c", "gunicorn.conf.py", "application:app"]

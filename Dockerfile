# Use Python 3.11 base image (as specified in langgraph.json)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster dependency installation
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml uv.lock ./
COPY requirements.txt ./

# Install Python dependencies using uv
RUN uv pip install --system -r requirements.txt

# Install LangGraph CLI
RUN pip install --no-cache-dir "langgraph-cli[inmem]"

# Copy application files
COPY langgraph.json ./
COPY graph.py ./
COPY app.py ./
COPY prompts/ ./prompts/
COPY vectorstore/ ./vectorstore/

# Create a non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8123

# Default command (can be overridden in docker-compose.yml)
CMD ["langgraph", "dev", "--host", "0.0.0.0", "--port", "8123"]

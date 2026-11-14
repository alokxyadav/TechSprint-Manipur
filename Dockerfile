# Multi-stage Dockerfile for AI Demand Intelligence Platform
# Includes Node.js backend + Python ML services

FROM node:22-slim AS base

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Install Node.js dependencies
RUN pnpm install --frozen-lockfile --prod

# Install Python ML dependencies
RUN pip3 install --no-cache-dir \
    prophet==1.2.1 \
    pytrends==4.9.2 \
    xgboost==3.1.3 \
    pandas==2.2.3 \
    numpy==1.26.4 \
    scikit-learn==1.8.0 \
    redis==7.1.0

# Copy application code
COPY . .

# Build frontend
RUN pnpm build

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]

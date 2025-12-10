FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

# Copy application code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev", "--", "--host"]


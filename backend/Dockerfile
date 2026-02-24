# c:\finalyearproject\career-roadmap-app\backend\Dockerfile
# Multi-stage build for production-ready image
FROM node:18-alpine

WORKDIR /app

# Install dependencies separately for caching
COPY package*.json ./
RUN npm install --production

# Copy application source
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]

# Multi-stage Dockerfile for development, testing, and production

# Base stage - common dependencies
FROM node:18 AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

# Development stage
FROM node:18 AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Test stage
FROM node:18 AS test
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

# Wait for database to be ready before running tests
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Set test environment
ENV NODE_ENV=test
ENV JWT_SECRET=test_jwt_secret_key

# Run tests with coverage
CMD ["sh", "-c", "wait-for-it.sh test-db:3306 --timeout=60 --strict -- npm run test:coverage"]

# Production stage
FROM base AS production
COPY . .
COPY .env .env
EXPOSE 3001
CMD ["npm", "start"]

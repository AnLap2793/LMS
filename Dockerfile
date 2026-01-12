# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app

# Build arguments for environment variables (optional)
ARG VITE_DIRECTUS_URL
ARG VITE_APP_ENV=production

# Set environment variables for build
ENV VITE_DIRECTUS_URL=${VITE_DIRECTUS_URL}
ENV VITE_APP_ENV=${VITE_APP_ENV}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

# Production Stage
FROM node:22-alpine
WORKDIR /app

# Install 'serve' package globally to serve static files
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 8989

# Start 'serve' on port 3000 in single-page-app mode (-s)
CMD ["serve", "-s", "dist", "-l", "8989"]

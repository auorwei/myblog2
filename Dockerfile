FROM node:22-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set working directory
WORKDIR /opt/app

# Copy package files first
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for development)
RUN npm ci

# Copy source code
COPY . .

# Ensure data directory exists and has correct permissions
RUN mkdir -p .tmp public/uploads

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S strapi -u 1001

# Change ownership of app directory
RUN chown -R strapi:nodejs /opt/app

# Switch to non-root user
USER strapi

# Expose port
EXPOSE 1337

# For development: use npm run develop instead of npm start
CMD ["npm", "run", "develop"] 
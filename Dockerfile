FROM node:18-alpine

# Set working directory
WORKDIR /opt/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p public/uploads

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S strapi -u 1001

# Change ownership
RUN chown -R strapi:nodejs /opt/app
USER strapi

# Expose port
EXPOSE 1337

# Start the application
CMD ["npm", "start"] 
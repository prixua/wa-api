# Use the official Puppeteer Docker image that comes with Chrome pre-installed
FROM ghcr.io/puppeteer/puppeteer:22.0.0

# Set the working directory
WORKDIR /app

# Switch to root temporarily to handle permissions correctly
USER root

# Create directory with proper permissions
RUN mkdir -p /app/node_modules && \
    chown -R pptruser:pptruser /app

# Copy package files with correct ownership
COPY --chown=pptruser:pptruser package*.json ./

# Switch back to pptruser for installation
USER pptruser

# Install dependencies
RUN npm ci --only=production

# Copy application code with correct ownership
COPY --chown=pptruser:pptruser . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3500
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Expose the port
EXPOSE 3500

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3500/status || exit 1

# Start the application
CMD ["npm", "start"]
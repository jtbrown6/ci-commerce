FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy from build stage
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/
COPY --from=build /app/src /app/src

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3003/health || exit 1

# Expose port
EXPOSE 3003

# Run the application
CMD ["node", "src/index.js"]

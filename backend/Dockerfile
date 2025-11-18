FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install only production dependencies for runtime
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
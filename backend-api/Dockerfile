FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Cloud Run injects PORT env var (defaults to 8080)
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "index.js"]

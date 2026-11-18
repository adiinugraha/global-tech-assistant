FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Final stage
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

ENV NODE_ENV=production

# Create volume for persistent SQLite data
VOLUME ["/usr/src/app/data"]

CMD ["npm", "start"]

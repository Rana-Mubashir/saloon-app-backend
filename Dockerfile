FROM node:20-alpine

WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache bash

# Set production environment
ENV NODE_ENV=production

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
# RUN npm run build
RUN npm install --only=production

# Copy application source
COPY . .

# Cleanup dev dependencies
RUN npm prune --production

EXPOSE 3000

CMD [ "npm" , "start" ]
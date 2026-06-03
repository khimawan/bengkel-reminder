FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Create database directory
RUN mkdir -p database

# Expose ports
EXPOSE 5000 3000

# Start the application
CMD ["npm", "run", "dev"]

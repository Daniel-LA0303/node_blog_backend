# ------------------ Stage 1: Build ------------------
# Use the official Node.js 18 Alpine image as the base for building the app
# Alpine is a minimal Linux distribution, which keeps the image small
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install only production dependencies (omit dev dependencies)
RUN npm install --omit=dev

# Copy the rest of the application code into the container
COPY . .

# ------------------ Stage 2: Final Image ------------------
# Start from a fresh Node.js 18 Alpine image for the final lightweight image
FROM node:18-alpine

# Set the working directory inside the final image
WORKDIR /app

# Copy node_modules and application code from the builder stage
COPY --from=builder /app ./

# Expose the port the app will run on (read from .env)
EXPOSE 4000

# Command to run the application
CMD ["node", "index.js"]


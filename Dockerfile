# Use the official Node.js image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Add PostgreSQL client to execute SQL scripts
RUN apt-get update && apt-get install -y postgresql-client

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

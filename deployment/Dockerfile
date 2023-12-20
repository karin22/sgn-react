# Use Node.js version 18.17.1 as a parent image
FROM node:18.17.1-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port that your app will run on
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]

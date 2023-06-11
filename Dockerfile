# Start with Node.js base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose the application on port 3000
EXPOSE 3000

# Define the command to start the application
CMD [ "npm", "start" ]



# Starts from the node:14 base image
# Sets the working directory to /app
# Copies over the package.json and package-lock.json (if it exists) files
# Installs the npm dependencies
# Copies the rest of the app
# Exposes port 3000 (assuming your application runs on this port; adjust as necessary)
# Runs the npm start command to start the application
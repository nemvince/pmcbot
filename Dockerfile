FROM --platform=linux/amd64 node:lts-alpine

WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install app dependencies
RUN npm install --omit=dev

# Generate prisma client
RUN npx prisma generate

# Copy app source code
COPY . .

# Expose port 3000
EXPOSE 3000
EXPOSE 3001

# Run the app
RUN chmod +x migrate-and-start.sh
CMD sh migrate-and-start.sh
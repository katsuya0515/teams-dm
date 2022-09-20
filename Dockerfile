FROM node:16

# Create app directory
WORKDIR /

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3978
CMD [ "node", "index.js" ]
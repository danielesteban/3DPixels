FROM node:carbon

# Set timezone
RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/Europe/Madrid /etc/localtime

# Install forever
ENV NODE_ENV=production
RUN yarn config set registry https://registry.npmjs.org
RUN yarn global add forever

# Create app directory
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server

# Install app dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install

# Bundle app source
COPY index.js .
COPY models models
COPY routes routes

# De-escalate privileges
USER node

# Start server
EXPOSE 8081
CMD [ "forever", "index.js" ]

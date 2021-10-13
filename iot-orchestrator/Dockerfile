FROM node:14

# non-root users
USER node

WORKDIR /home/node

# setup environment
COPY package.json .
RUN npm install

COPY *.js .
CMD ["npm", "start"]
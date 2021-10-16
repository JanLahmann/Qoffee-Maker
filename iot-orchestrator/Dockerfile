FROM node:14

LABEL org.opencontainers.image.source=https://github.com/JanLahmann/Qoffee-Maker

# non-root users
USER node

WORKDIR /home/node

# setup environment
COPY package.json .
RUN npm install

COPY *.js .
CMD ["npm", "start"]
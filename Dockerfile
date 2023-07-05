FROM node:18.16.0-alpine as base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV production

EXPOSE 3649

CMD [ "node", "index.js" ]
FROM node:24-alpine3.20

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 3333

CMD ["npm", "start"]

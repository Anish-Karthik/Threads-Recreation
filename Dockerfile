FROM node:latest

WORKDIR /usr/src/app

COPY . .
RUN npm install
RUN npm run build

CMD ["npm", "run", "dev"]

EXPOSE 3000
FROM node:latest as build

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --production

FROM nginx:latest

COPY ./.nginx/nginx.conf.template /etc/nginx/templates/default.conf.template

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build app/dist/angular-template/browser /usr/share/nginx/html

EXPOSE 80
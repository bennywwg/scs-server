FROM node:17-alpine3.13
WORKDIR /app
COPY . /app
RUN npm install
RUN apk add glslang
CMD ["npm", "start"]
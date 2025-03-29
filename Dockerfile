FROM node:22.14-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN apk add curl

# ENV NODE_ENV=production

CMD ["node", "--experimental-transform-types", "--env-file=.env", "src/index.ts"]

#stage 1: build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

#stage 2 runtime

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist /app/src

COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 9102 50052

CMD [ "node", "src/index.js"]


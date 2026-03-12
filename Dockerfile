FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=builder /app ./
COPY .env .env

ENV NODE_ENV=production
ENV UV_THREADPOOL_SIZE=64

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]
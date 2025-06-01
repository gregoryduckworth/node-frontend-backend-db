# syntax=docker/dockerfile:1
FROM node:lts-slim AS base
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install

COPY . .

CMD ["yarn", "run", "dev"]

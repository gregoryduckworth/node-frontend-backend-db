# syntax=docker/dockerfile:1
FROM node:lts-slim AS base

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ["yarn", "run", "dev"]

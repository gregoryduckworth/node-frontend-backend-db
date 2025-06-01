# syntax=docker/dockerfile:1
FROM node:lts-slim AS base

WORKDIR /app

# Install security updates
RUN apt-get update && apt-get upgrade -y && apt-get clean

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ["yarn", "run", "dev"]

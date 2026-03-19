FROM node:22-alpine AS build
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN corepack enable && pnpm fetch
COPY . .
RUN pnpm install --offline
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm --filter dashboard build

FROM nginx:alpine
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

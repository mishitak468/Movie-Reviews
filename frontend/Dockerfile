FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

COPY patch-tsconfig.cjs ./
RUN node patch-tsconfig.cjs
RUN sed -i 's|from "vitest/config"|from "vite"|g' vite.config.ts

ARG VITE_USE_MOCK=false
ARG VITE_API_URL=/api
ENV VITE_USE_MOCK=$VITE_USE_MOCK
ENV VITE_API_URL=$VITE_API_URL

RUN npx vite build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

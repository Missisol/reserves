FROM node:22-alpine AS build

# ARG VITE_APP_FAVICON_PATH=/favicon.svg
ENV VITE_APP_FAVICON_PATH=${VITE_APP_FAVICON_PATH}

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8084

CMD ["nginx", "-g", "daemon off;"]

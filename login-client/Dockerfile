# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# instala solo deps de producción (express debe estar en dependencies)
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
# copia artefactos del build
COPY --from=build /app/server.cjs ./server.cjs
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node","server.cjs"]

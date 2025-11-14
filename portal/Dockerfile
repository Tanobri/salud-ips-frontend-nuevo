# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# 👇 OJO: ahora copiamos desde la carpeta portal del repo
COPY portal/package*.json ./
RUN npm ci

# 👇 Y después copiamos todo el código del frontend desde portal/
COPY portal/ ./
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# instalar solo deps de producción (express debe estar en dependencies)
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

# copiar artefactos del build
COPY --from=build /app/server.cjs ./server.cjs
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node","server.cjs"]

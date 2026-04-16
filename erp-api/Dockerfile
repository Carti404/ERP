# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Eliminar dependencias de desarrollo y dejar solo producción
RUN npm prune --production

# Etapa 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Instalar netcat (nc) para el healthcheck de la base de datos en el entrypoint
RUN apk add --no-cache netcat-openbsd bash

# Copiar desde la etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Copiar las migraciones fuentes por si TypeORM las necesita leer directamente (aunque dist suele bastar)
COPY --from=builder /app/src/database/migrations ./src/database/migrations

# Copiar el script de entrada
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Variables de entorno por defecto
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]

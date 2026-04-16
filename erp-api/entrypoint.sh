#!/bin/bash
set -e

# Esperar a que la base de datos esté lista
# DB_HOST y DB_PORT deben estar definidos en el entorno
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "Esperando a PostgreSQL en $DB_HOST:$DB_PORT..."

# Intentar conectar a la BD (máximo 10 intentos)
MAX_RETRIES=10
COUNT=0

until nc -z "$DB_HOST" "$DB_PORT" || [ $COUNT -eq $MAX_RETRIES ]; do
  echo "PostgreSQL no disponible, reintentando en 3s... ($((COUNT+1))/$MAX_RETRIES)"
  sleep 3
  COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "Error: No se pudo conectar a PostgreSQL tras $MAX_RETRIES intentos."
  exit 1
fi

echo "PostgreSQL está listo."

# Ejecutar migraciones si la variable está activa
if [ "$RUN_MIGRATIONS" = "true" ] || [ "$RUN_MIGRATIONS" = "1" ]; then
  echo "Ejecutando migraciones de TypeORM..."
  # Usamos el script ya definido en package.json pero apuntando a los archivos compilados en dist
  npm run typeorm -- migration:run -d dist/database/data-source.js
fi

# Ejecutar seed de administrador si la variable está activa
if [ "$RUN_SEED_ADMIN" = "true" ] || [ "$RUN_SEED_ADMIN" = "1" ]; then
  echo "Ejecutando seed de administrador..."
  node dist/scripts/seed-admin.js
fi

# Iniciar la aplicación
echo "Iniciando ERP API..."
exec node dist/main.js

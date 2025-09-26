#!/bin/bash
set -e

# Load .env
if [ -f .env ]; then
  set -a
  . .env
  set +a
else
  echo ".env file not found"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL not set in .env file"
    exit 1
fi

# Regex to extract user, password, host, port, and dbname from a postgresql URL
# postgresql://user:password@host:port/dbname
regex='^postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/([^?]+)'

if [[ $DATABASE_URL =~ $regex ]]; then
  PG_USER="${BASH_REMATCH[1]}"
  PG_PASSWORD="${BASH_REMATCH[2]}"
  PG_HOST="${BASH_REMATCH[3]}"
  PG_PORT="${BASH_REMATCH[4]}"
  DB_NAME="${BASH_REMATCH[5]}"
else
  echo "Could not parse DATABASE_URL. Please check the format in your .env file."
  echo "Expected format: postgresql://user:password@host:port/dbname"
  exit 1
fi

export PGPASSWORD=$PG_PASSWORD

echo "Checking for database: $DB_NAME on $PG_HOST:$PG_PORT"

# Check if database exists, and create it if it doesn't
if psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Database '$DB_NAME' already exists."
else
    echo "Database '$DB_NAME' does not exist. Creating..."
    createdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$DB_NAME"
    echo "Database created."
fi


echo "Applying migrations..."
pnpm run db:push

echo "Database setup complete."

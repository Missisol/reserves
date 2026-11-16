#/bin/bash
docker compose --env-file .env.prod -f compose.prod.yaml up --build -d
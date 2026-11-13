## Запуск

### Бэкенд (Flask)

```bash
cd backend
uv sync
# uv run python run.py
```
Команда	Описание
`uv sync`	Установит зависимости из uv.lock в виртуальное окружение
`uv sync --frozen`	То же самое, но не обновит uv.lock, даже если зависимости изменились
`uv lock`	Пересоберёт uv.lock на основе актуальных pyproject.toml и uv.lock

активировать .venv и
```
flask run
```

Сервер запустится на `http://localhost:5000`.

Запросы к `/api/*` проксируются на Flask.


### Фронтенд (Vue3)

```bash
pnpm run dev
```

---

## Docker

### Сборки

| Сборка          | Назначение                      |
|-----------------|---------------------------------|
| `dev`           | Hot-reload, Vite dev server,    |
|                 | Flask в режиме отладки          |
| `prod`          | Gunicorn, статика через Nginx,  |
|                 | без hot-reload                  |

### Быстрый старт

**Development** — исходники монтируются как volume, работает HMR, 
  обязательно указание .env файла для подстановки переменной DB_PATH:

```bash
docker compose --env-file .env.dev -f compose.dev.yaml up --build -d
```

- Фронтенд: http://localhost:5174
- API: http://localhost:5174/api/* (через Vite proxy)

**Production** — фронтенд собран, отдаётся через Nginx:

```bash
docker compose -f compose.prod.yaml up --build -d
```

- Приложение: http://localhost:80
- Бэкенд доступен из контейнера фронтенда по адресу `http://backend:5000`

### Команды

```bash
# Dev-окружение
docker compose --env-file .env.dev -f compose.dev.yaml up --build -d    # запустить с передачей env-файла через CLI для подстановки ${DATABASE_URL}
docker compose -f compose.dev.yaml down              # остановить
docker compose -f compose.dev.yaml logs -f           # логи

# Prod-окружение
docker compose -f compose.prod.yaml up --build -d    # запустить
docker compose -f compose.prod.yaml down -v          # остановить + очистить БД
docker compose -f compose.prod.yaml logs -f          # логи

# Миграции БД (prod)
docker compose -f compose.prod.yaml exec backend uv run flask db upgrade
```

### Переменные окружения

| Файл                      | Описание                        |
|---------------------------|---------------------------------|
| `frontend/.env.dev`       | Прокси-таргет для Vite (dev)    |
| `backend/.env.prod`       | Секреты и DB-URL (prod)         |

Перед запуском в продакшне обновите `SECRET_KEY` в `backend/.env.prod`:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Архитектура

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Browser │────▶│  Nginx :80   │────▶│ Backend  │
│          │     │  /api/ →     │     │ :5000    │
│          │     │  / → static  │     │ SQLite   │
└──────────┘     └──────────────┘     └──────────┘
```

**Dev-режим** — Nginx заменяется Vite dev-server с встроенным прокси `/api` на `backend:5000`.
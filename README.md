## Запуск

### Бэкенд (Flask)

Установите зависимости:

```bash
cd backend
uv sync
```

Команда	Описание
`uv sync`	Установит зависимости из uv.lock в виртуальное окружение
`uv sync --frozen`	То же самое, но не обновит uv.lock, даже если зависимости изменились
`uv lock`	Пересоберёт uv.lock на основе актуальных pyproject.toml и uv.lock

Запустите сервер — два варианта:

#### Вариант 1 — через `uv run`

Не требует активации `.venv`, работает из каталога `backend`:

```bash
uv run python run.py
```

#### Вариант 2 — через активированный `.venv`

```bash
source .venv/bin/activate
flask run
```

Сервер запустится на `http://localhost:5000`.
Запросы к `/api/*` проксируются на Flask.


### Фронтенд (Vue3)

```bash
pnpm run dev
```

---

## База данных

Бэкенд использует **SQLite** через **Flask-SQLAlchemy**, а схема версионируется
**Flask-Migrate** (Alembic). Каталог `backend/migrations/` уже инициализирован
и содержит первую миграцию с таблицами `reserve_category` и `reserve`.

### Расположение БД

Путь задаётся переменной `DATABASE_URL` (см. `backend/config.py`). Если она
не задана, используется `sqlite:///<backend>/app.db`.

| Окружение | Источник                       | Расположение файла БД                              |
|-----------|--------------------------------|----------------------------------------------------|
| Локально  | `backend/.env` → `DATABASE_URL`| `sqlite:////home/marina/RaspberryPi/reserves_db/reserves.db` |
| Dev       | `.env.dev` → `DB_PATH` (volume)| тот же файл, примонтирован в контейнер             |
| Prod      | `.env.prod` → `DATABASE_URL`   | volume `backend-data` (`/app/instance`)            |

### Инициализация и миграции (локально)

#### Вариант 1 — через `uv run`

Не требует активации `.venv`, команды работают из каталога `backend`:

```bash
uv run flask db upgrade          # применить миграции — создаёт таблицы (первичная инициализация БД)
```

Команды работы со схемой:

Команда	Описание
`uv run flask db upgrade`	Применить ещё не наложенные миграции к базе
`uv run flask db migrate -m "комментарий"`	Сгенерировать миграцию из изменений в `app/models.py`
`uv run flask db downgrade`	Откатить последнюю миграцию
`uv run flask db init`	Создать каталог `migrations/` (выполнять не нужно — он уже есть)

Типовой цикл после правки моделей:

```bash
# 1. изменить app/models.py
uv run flask db migrate -m "add column ..."   # 2. сгенерировать миграцию
uv run flask db upgrade                       # 3. наложить её на БД
```

#### Вариант 2 — через активированный `.venv`

Сначала активируйте виртуальное окружение в каталоге `backend`:

```bash
source .venv/bin/activate
```

Затем используйте те же команды без `uv run`:

```bash
flask db upgrade
flask db migrate -m "комментарий"
flask db downgrade
```

### Миграции в Docker

```bash
# Prod
docker compose -f compose.prod.yaml exec backend uv run flask db upgrade

# Dev (env-файл нужен для подстановки ${DB_PATH})
docker compose --env-file .env.dev -f compose.dev.yaml exec backend uv run flask db upgrade
```

### Работа с данными

Интерактивная сессия с моделями (доступны `db` и `app`):

```bash
flask shell
```

```python
from app.models import Reserve, ReserveCategory
db.session.add(ReserveCategory(name='Крупы'))
db.session.commit()
ReserveCategory.query.all()
```

> Удаление категории не удаляет связанные запасы: внешний ключ объявлен с
> `ondelete='SET NULL'`, поэтому у резервов обнуляется `category_id`.

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
| `.env.dev`       | Прокси-таргет для Vite (dev)    |
| `.env.prod`       | Секреты и DB-URL (prod)         |

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
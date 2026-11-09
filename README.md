## Запуск

### Бэкенд (Flask)

```bash
cd backend
uv sync
# uv run python run.py
```
активировать .venv и
```
flask run
```

Сервер запустится на `http://localhost:5000`.

```
uv pip install -r pylock.toml
```

Запросы к `/api/*` проксируются на Flask.


### Фронтенд (Vue3)

```bash
pnpm run dev
```
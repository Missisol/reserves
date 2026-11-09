from flask import Flask


def create_app() -> Flask:
    app = Flask(__name__)

    @app.route("/")
    def index():
        return {"message": "Hello from backend!"}

    return app


def main() -> None:
    app = create_app()
    app.run(debug=True)

from flask import Blueprint

bp = Blueprint('reserves', __name__)

from app.reserves import routes
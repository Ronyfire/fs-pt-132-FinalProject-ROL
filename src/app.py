"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from datetime import timedelta
from extensions import bcrypt, mail
from flask_cors import CORS
import cloudinary

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')

app = Flask(__name__)
app.url_map.strict_slashes = False
app.url_map.redirect_defaults = False 

CORS(app, supports_credentials=True, resources={r"/api/*": {
    "origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://silver-enigma-q7j7xqg9vvqpc4jwj-3000.app.github.dev",
        "https://silver-enigma-q7jxqg9vvqpc4jwj-3000.app.github.dev",
        "https://shiny-carnival-q7jp7q7rqqp4h97qp-3000.app.github.dev",
        "https://cautious-fortnight-xvpv9pj66qv39vgj-3000.app.github.dev",
    ],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
}})

# ── Database ──────────────────────────────────────────────────
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATIONS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.realpath(__file__))),
    "migrations"
)
MIGRATE = Migrate(app, db, compare_type=True, directory=MIGRATIONS_DIR)
db.init_app(app)
bcrypt.init_app(app)

# ── JWT ───────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"]            = "LOR OF THE RINGS"
app.config["JWT_ACCESS_TOKEN_EXPIRES"]  = timedelta(days=7)
jwt = JWTManager(app)

# ── Mail ──────────────────────────────────────────────────────
app.config["MAIL_SERVER"]         = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"]           = int(os.getenv("MAIL_PORT", 2525))
app.config["MAIL_USERNAME"]       = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"]       = os.getenv("MAIL_PASSWORD")
app.config["MAIL_USE_TLS"]        = os.getenv("MAIL_USE_TLS", "True") == "True"
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER", "noreply@gameside.com")
mail.init_app(app)

# ── IGDB ──────────────────────────────────────────────────────
app.config["IGDB_CLIENT_ID"]     = os.getenv("IGDB_CLIENT_ID")
app.config["IGDB_CLIENT_SECRET"] = os.getenv("IGDB_CLIENT_SECRET")

# ── Cloudinary ────────────────────────────────────────────────
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key    = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure     = True
)

# ── Blueprints ────────────────────────────────────────────────
setup_admin(app)
setup_commands(app)
app.register_blueprint(api, url_prefix='/api')

# ── Error handler ─────────────────────────────────────────────
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=PORT, debug=True)

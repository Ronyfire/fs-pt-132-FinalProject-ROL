# This file was created to run the application on heroku using gunicorn.
# Read more about it here: https://devcenter.heroku.com/articles/python-gunicorn
import os
from flask_migrate import upgrade
from app import app as application


if os.getenv("RUN_DB_UPGRADE_ON_START", "1") == "1":
    with application.app_context():
        upgrade()

if __name__ == "__main__":
    application.run()

from flask import Flask
from app import app, SQLAlchemy

db = SQLAlchemy(app)

with app.app_context():
    db.create_all()
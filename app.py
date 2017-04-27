import os
from whitenoise import WhiteNoise
from flask import (Flask, render_template, redirect, request, abort, url_for,
                   make_response)
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.wsgi_app = WhiteNoise(app.wsgi_app, root="static/")

# Configurations
# Using environmental variables for secret key and database url
# Secret key is used to sign cookies, so it's secure to keep it hidden
app.config.update(
    SECRET_KEY=os.environ["SECRET_KEY"],
    SQLALCHEMY_DATABASE_URI=os.environ["DATABASE_URL"],
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Must import after db is defined, not pretty
from models import User

@app.route('/')
def index():
    return render_template("index.html")

# For testing purposes
@app.route('/users')
def users():
    return "<br>".join(map(lambda x: str(x), User.query.all()))

@app.route('/register')
def register():
    errormessage = request.args.get("errormessage", default="")
    return render_template("register.html", errormessage=errormessage)

@app.route('/register/submit', methods=["POST"])
def submit():
    username = request.form.get("username")
    name = request.form.get("name", default="")
    email = request.form.get("email")
    password = request.form.get("password")
    
    # Quick way to check if any of these is empty
    # Should implement javascript password checker to prevent this
    if "" in [username, email, password]:
        errormessage = "Username, email, and password are required."
        return redirect(url_for("register", errormessage=errormessage))
    
    new_user = User(username, email, name, password)
    db.session.add(new_user)
    db.session.commit()
    
    response = make_response(redirect(url_for("user")))
    response.set_cookie("username", username)
    
    return response

@app.route('/user')
def user():
    username = request.cookies.get("username")
    return render_template("user.html", username=username)

@app.route('/login')
def login():
    return render_template("login.html")

@app.route('/login/validate', methods=["POST"])
def validate():
    username = request.form.get("username")
    password = request.form.get("password")
    
    if None in [username, password]:
        return redirect(url_for("login"))
    
    if validate_password(username, password):
        response = make_response(redirect(url_for("user")))
        response.set_cookie("username", username)
        return response
    else:
        return redirect(url_for("login"))
    
def validate_password(username, password):
    user = User.query.filter_by(username=username)[0]
    return user.check_password(password)

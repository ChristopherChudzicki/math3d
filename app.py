import os
import datetime
from flask import (Flask, render_template, redirect, request, abort, url_for,
                   make_response, abort, jsonify)
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect, generate_csrf

app = Flask(__name__)

CSRFProtect().init_app(app)

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
from models import User, Graph

@app.after_request
def add_csrf_to_cookie(response):
    """Adds csrf_token to cookie

    Add to cookies with every response.
    """
    return_response = make_response(response)
    return_response.set_cookie("csrf_token", generate_csrf())
    return return_response

# Pages
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/register')
def register():
    errormessage = request.args.get("errormessage", default="")
    return render_template("register.html", errormessage=errormessage)

@app.route('/login')
def login():
    return render_template("login.html")

# Handlers for Client-Side Requests
@app.route('/api/graph/save', methods=["POST"])
def save_graph():
    # Angular sends json data by default
    title = request.json.get("title")
    serialized_graph = request.json.get("serialized_graph")
    username = request.cookies.get("username")

    new_graph = Graph(title, serialized_graph, username)
    db.session.add(new_graph)
    db.session.commit()

    return "Success!"

@app.route('/api/graph/get')
def get_graphs():
    username = request.cookies.get("username")
    graph_objs = User.query.filter_by(username=username).first().graphs
    graphs = [graph.serialize() for graph in graph_objs]
    
    return jsonify(graphs)

@app.route('/api/login/validate', methods=["POST"])
def validate():
    username = request.form.get("username")
    password = request.form.get("password")

    if "" in [username, password]:
        return redirect(url_for("login"))

    if validate_password(username, password):
        response = redirect(url_for("index"))
        return add_logged_in_cookie(response, username)
    else:
        return redirect(url_for("index"))

@app.route('/api/login/username_exists', methods=["POST"])
def check_username():
    """Checks if the given username already exists

    Javascript side sends post request to this address.
    """
    username = request.form.get("username")
    if username:
        if User.query.filter_by(username=username).first():
            return False
        else:
            return True

@app.route('/api/register/submit', methods=["POST"])
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

    response = redirect(url_for("index"))

    return add_logged_in_cookie(response, username)

# Helper Functions
def validate_password(username, password):
    user = User.query.filter_by(username=username).first()
    if user:
        return user.check_password(password)
    else:
        return False

def add_logged_in_cookie(response, username):
    return_response = make_response(response)
    expiry_date = datetime.datetime.now()
    expiry_date += datetime.timedelta(days=30)
    return_response.set_cookie("username", username, expires=expiry_date)
    return return_response

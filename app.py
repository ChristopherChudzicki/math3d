import logging
from whitenoise import WhiteNoise
from flask import Flask, render_template, redirect

app = Flask(__name__)
app.wsgi_app = WhiteNoise(app.wsgi_app, root="static/")

@app.route('/')
def index():
    return render_template("index.html")

# Hacky, need to find who's making this wrong request.
@app.route('/resources/templates/common.html')
def record():
    return redirect("/static/resources/templates/common.html")
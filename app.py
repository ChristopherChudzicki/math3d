import logging

from flask import Flask, render_template, redirect
app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

# Hacky, need to find who's making this wrong request.
@app.route('/resources/templates/common.html')
def record():
    return redirect("/static/resources/templates/common.html")
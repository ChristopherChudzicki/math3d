# MIT License
#
# Copyright (c) 2017 Luming Chen
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

from datetime import datetime
from hashlib import md5

from app import db, bcrypt

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    email = db.Column(db.String(120), unique=True)
    name = db.Column(db.String())
    pw_hash = db.Column(db.String())
    graphs = db.relationship("Metadata", backref="user")
    
    def __init__(self, username, email, name, password):
        self.username = username
        self.email = email
        self.name = name
        self.pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    
    def __str__(self):
        return self.username
    
    def __repr__(self):
        return str({
            "username": self.username,
            "email": self.email,
            "name": self.name,
        })
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.pw_hash, password)

class Graph(db.Model):
    __tablename__ = "graphs"
    
    id = db.Column(db.Integer, primary_key=True)
    meta = db.relationship("Metadata", uselist=False, backref="graph")
    serialized_string = db.Column(db.String())
    
    def __init__(self, serialized_string):
        self.serialized_string = serialized_string
    
    def __str__(self):
        return self.meta.title
        pass
    
    def __repr__(self):
        return str({
            "user_name": self.meta.user_name,
            "short_url": self.meta.short_url,
            "created_at": str(self.meta.created_at),
        })
    
    def serialize(self):
        return {
            "title": self.meta.title,
            "serialized_string": self.serialized_string,
            "username": self.meta.user_name,
            "created_at": str(self.meta.created_at),
        }

class Metadata(db.Model):
    __tablename__ = "meta"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String())
    created_at = db.Column(db.DateTime)
    graph_id = db.Column(db.Integer, db.ForeignKey("graphs.id"))
    user_name = db.Column(db.String(), db.ForeignKey("users.username"), nullable=True)
    short_url = db.Column(db.String())
    
    def __init__(self, title, graph_id, username):
        self.title = title
        self.graph_id = graph_id
        self.user_name = username
        self.short_url = ""
        self.created_at = datetime.utcnow()
    
    def __str__(self):
        return self.title
    
    def __repr__(self):
        return str({
            "title": self.title,
            "author": self.user_name,
            "graph_id": self.graph_id,
        })
    
    def generate_hash(self):
        if not self.short_url:
            self.short_url = self.__get_hash()
    
    # Two underscores is Python's "private" method
    # https://docs.python.org/3/tutorial/classes.html#tut-private
    def __get_hash(self):
        return md5((self.title + str(self.graph_id)).encode("utf-8")).hexdigest()

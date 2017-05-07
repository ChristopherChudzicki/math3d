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
    graphs = db.relationship("Graph", backref="user", lazy="dynamic")
    
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
    created_at = db.Column(db.DateTime)
    title = db.Column(db.String())
    serialized_string = db.Column(db.String())
    user_name = db.Column(db.String(), db.ForeignKey("users.username"), nullable=True)
    short_url = db.Column(db.String())
    
    def __init__(self, title, serialized_string, user_name):
        self.created_at = datetime.utcnow()
        self.title = title
        self.serialized_string = serialized_string
        self.user_name = user_name
        self.short_url = self.__get_hash()
    
    def __str__(self):
        return self.title
    
    def __repr__(self):
        return str({
            "title": self.title,
            "user_name": self.user_name,
            "short_url": self.short_url,
            "created_at": str(self.created_at),
        })
    
    def serialize(self):
        return {
            "title": self.title,
            "serialized_string": self.serialized_string,
            "username": self.user_name,
            "created_at": str(self.created_at),
        }
    
    # Two underscores is Python's "private" method
    # https://docs.python.org/3/tutorial/classes.html#tut-private
    def __get_hash(self):
        return md5((self.title + str(self.id)).encode("utf-8")).hexdigest()

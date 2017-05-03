import os
os.environ["SECRET_KEY"] = 'super_secret'
os.environ["DATABASE_URL"] = "postgres://127.0.0.1/math3d"

from app import app as app

def local_startup():
    """Called upon python -m app."""
    app.run(host='0.0.0.0', port=5000, debug=True)
    
local_startup()
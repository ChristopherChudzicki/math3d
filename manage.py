import os, json
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

from app import app, db
import models

migrate = Migrate(app, db)
manager = Manager(app)

manager.add_command("db", MigrateCommand)

# TODO: 
# (test): seed should fail if run twice now that short_url is unqiue
# (resolve): seed should be able to update existing examples

@manager.command
def seed():
    """Seed database with examples"""
    for fullname in os.listdir("static/examples"):
        filename, extension = os.path.splitext(fullname)
        relpath = "static/examples/" + fullname
        if extension == '.json':
            with open(relpath) as f:
                settings = json.load(f)
                title = settings.get('title')
                short_url = filename
                username = None
                
                meta = db.session.query(models.Metadata).filter_by(short_url=short_url).first()

                if meta == None:
                    new_graph = models.Graph(settings)
                    db.session.add(new_graph)
                    db.session.commit()
                    
                    new_meta = models.Metadata(title, new_graph.id, username, short_url=short_url)
                    db.session.add(new_meta)
                    db.session.commit()
                    
                else:
                    graph = db.session.query(models.Graph).filter_by(id=meta.graph_id).first()
                    graph.settings = settings
                    meta.title=title
                    db.session.commit()

if __name__ == "__main__":
    manager.run()
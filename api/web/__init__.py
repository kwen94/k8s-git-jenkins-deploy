from flask import Flask
from flask_socketio import SocketIO

socketio = SocketIO()



def create_app():
    app = Flask(__name__)

    from views import deploy_blueprint
    from views.login import login_blueprint
    app.register_blueprint(deploy_blueprint, url_prefix='/api/v1/deploy')
    app.register_blueprint(login_blueprint, url_prefix='/api/v1/login')

    socketio.init_app(app)
    return app
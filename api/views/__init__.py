from flask import Blueprint

deploy_blueprint = Blueprint('deploy', __name__)

from . import socket, deploy
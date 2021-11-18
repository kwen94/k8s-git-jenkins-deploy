import time
from flask import Blueprint, g

from utils.utils import get_post_data, return_resp
from utils.encryption import make_jwt

from config import JWT_EXPIRE


login_blueprint = Blueprint('login', __name__)


# 登录接口
@login_blueprint.route('/', methods=['POST'])
@get_post_data
def login():
    username = g.data.get('username', "").strip()
    password = g.data.get('password', "").strip()

    if not any((username, password)):
        return return_resp("账号或密码为空", 998)

    if username == "admin" and password == "passpass":
        token = make_jwt(username)
        return return_resp({
            "token": token,
            "username": username,
            "expire": int(time.time()) + JWT_EXPIRE
        })
    elif username == "test" and password == "test":
        token = make_jwt(username)
        return return_resp({
            "token": token,
            "username": username,
            "expire": int(time.time()) + JWT_EXPIRE
        })
    else:
        return return_resp("账号或密码错误", 999)
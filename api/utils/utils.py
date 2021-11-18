import json
from functools import wraps
from flask import request, g
from .encryption import restore_jwt



def return_resp(data, code=0):
    return {
        "code": code,
        "data": data
    }


def load_post_data():
    """
    序列化request post数据
    :return:
    """
    data = request.get_data()
    if request.method == 'POST':
        try:
            data = json.loads(data)
            g.data = data
        except:
            return {
                "code": 1,
                "data": "POST数据格式错误"
            }

def auth_check(func):
    """
    认证装饰器
    :param func:
    :return:
    """
    @wraps(func)
    def _wrapper(*args, **kwargs):
        token = request.headers.get('token')
        if not token:
            return return_resp("token缺失", 997)
        jwt_dict = restore_jwt(token)
        if not jwt_dict[0]:
            return return_resp("token无效", 996)
        if jwt_dict[1].get('username') != 'admin':
            load_post_data()  # 获取request数据
            env = g.data.get('env')
            if env == None:
                return return_resp("参数缺失", 990)
            if env == "prod":
                return return_resp("你没有权限发布prod环境", 401)
        result = func(*args, **kwargs)
        return result
    return _wrapper


def get_post_data(func):
    """
    获取post数据
    :param func:
    :return:
    """
    @wraps(func)
    def _wrapper(*args, **kwargs):
        r = load_post_data()
        if r:
            return r
        result = func(*args, **kwargs)
        return result
    return _wrapper



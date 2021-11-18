import jwt
import time


from config import JWT_EXPIRE, JWT_SECRET_SALT


def make_jwt(username, expire=JWT_EXPIRE):

    token_dict = {
        'username': username,
        'iat': int(time.time()),
        'exp': int(time.time()) + expire,
    }

    headers = {
      "alg": "HS256",
      "typ": "JWT"
    }

    jwt_token = jwt.encode(token_dict,  # payload, 有效载体
                           JWT_SECRET_SALT,  # 进行加密签名的密钥
                           algorithm="HS256",  # 指明签名算法方式, 默认也是HS256
                           headers=headers  # json web token 数据结构包含两部分, payload(有效载体), headers(标头)
                           )
    return jwt_token


def restore_jwt(jwt_token):
    data = None
    try:
        data = jwt.decode(jwt_token, JWT_SECRET_SALT, algorithms=['HS256'])
    except Exception as e:
        # 如果 jwt 被篡改过; 或者算法不正确; 如果设置有效时间, 过了有效期; 或者密钥不相同; 都会抛出相应的异常
        return False, str(e)
    else:
        # 解析出来的就是 payload 内的数据
        return True, data


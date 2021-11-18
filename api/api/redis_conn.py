#-*- coding: utf-8 -*-
import redis
import json

class RedisConn():
    def __init__(self,connection_settings):
        """
        初始化redis连接
        """
        self.db_config = connection_settings

    def poolConn(self):
        obj = redis.Redis(connection_pool=redis.ConnectionPool(
                                                                host=self.db_config['host'],
                                                                port=self.db_config['port'],
                                                                password=self.db_config['password']),
                                                                socket_connect_timeout=5,
                                                                socket_timeout=10,
                                                                max_connections=200)
        obj.exists_get_str = self.exists_get_str(obj)
        obj.exists_ttl_str = self.exists_ttl_str(obj)
        obj.exists_get_json = self.exists_get_json(obj)
        obj.exists_get_bytes = self.exists_get_bytes(obj)
        return obj

    @staticmethod
    def exists_get_str(obj):
        '''redis 获取 值为 str 的方法'''
        def _handler(name):
            if not obj.exists(name):
                return None
            return obj.get(name).decode('utf-8')
        return _handler

    @staticmethod
    def exists_ttl_str(obj):
        '''redis 获取 值为 str 的方法'''
        def _handler(name):
            if not obj.exists(name):
                return 0
            return obj.ttl(name)#.decode('utf-8')
        return _handler

    @staticmethod
    def exists_get_json(obj):
        '''redis 获取 值为 json 的方法'''
        def _handler(name):
            if not obj.exists(name):
                return None
            return json.loads(obj.get(name))
        return _handler

    @staticmethod
    def exists_get_bytes(obj):
        '''redis 获取 值为 bytes 的方法'''
        def _handler(name):
            if not obj.exists(name):
                return None
            return obj.get(name)
        return _handler


#!/usr/bin/python
#coding=utf8

# 使用方法:
# python tke_tag_list.py rrtv/fe-toutiao 5
# 第一个参数为仓库名,第二个参数为显示多少个Tag
import time
import random
import hmac
import hashlib
import binascii
import urllib
import requests
import json
from config import DOCKER_REPO_PREFIX



class Tag:
    def __init__(self, repo):
        self.repo = repo

    def list(self, service_name, size=10):
        return self.query(self.repo + service_name, size)

    def Sign_make(self, requestHost, requestUri, params, secretKey, method = 'GET'):
        srcStr = method.upper() + requestHost + requestUri + '?' + "&".join(k.replace("_", ".") + "=" + str(params[k]) for k in sorted(params.keys()))
        hashed = hmac.new(secretKey.encode('utf8'), srcStr.encode('utf8'), hashlib.sha1)
        return binascii.b2a_base64(hashed.digest())[:-1]

    def make_url(self, requestHost, requestUri, params, secretKey, method = 'GET'):
        srcStr = 'https://' + requestHost + requestUri + '?' + "&".join(k.replace("_", ".") + "=" + str(params[k]) for k in sorted(params.keys()))
        return srcStr

    def format_response_tag(self, text):
        response_dict = json.loads(text)
        if response_dict.get('code') != 0:
            print('Request Error')
            return False
        taginfo = response_dict['data']['tagInfo']
        tag_list = []
        for tag_detail in taginfo:
            tag_list.append(tag_detail['tagName'])

        return tag_list

    def query(self, reponame, limit):  # reponame = 'rrtv/fe-toutiao'
        requestHost = 'ccr.api.qcloud.com'
        requestUri = '/v2/index.php'
        timestamp = int(time.time())
        nonce = random.randint(1111111, 999999999)
        secrekey = 'asdsadsadsa5a2'

        params = {
            'Action': 'GetTagList',
            'Region': 'ap-shanghai',
            'SecretId': 'ASDSADSADASDASDASD',
            'Timestamp': timestamp,
            'Nonce': nonce,
            'offset': 0,
            'limit': limit,
            'reponame': reponame # tsf_3222155293/rrtv-defender-prd
        }

        str_join = self.Sign_make(requestHost, requestUri, params, secrekey)
        Signature = urllib.request.quote(str_join)
        params['Signature'] = Signature
        get_url = self.make_url(requestHost, requestUri, params, secrekey)
        response = requests.get(get_url)
        return self.format_response_tag(response.text)


app_tag = Tag(DOCKER_REPO_PREFIX)

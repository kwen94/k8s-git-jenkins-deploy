
# k8s配置文件目录
DEV_KUBERNETES_FILE = './k8s-config/dev-k8s-config'
PROD_KUBERNETES_FILE = './k8s-config/prod-k8s-config'

# Docker镜像仓库前缀
DOCKER_REPO_PREFIX = 'nan/'

# jenkins 相关配置
JENKINS_USERNAME = 'api-deploy'
JENKINS_PASSWORD = '123456789'
JENKINS_URL = 'http://10.0.63.11:8080/'

import os
deploy_env = os.environ.get('deploy_env')
print(deploy_env)
if deploy_env == "release":
   JENKINS_PROJECT_NAME = 'deploy-api-发布对接-正式环境'
else:
   JENKINS_PROJECT_NAME = 'deploy-api-发布对接-示例环境'


# pod list 数据缓存时间(秒)
INTERVAL = 10

# redis配置
REDIS_CONFIG = {
   "host": "127.0.0.1",
   "port": 6379,
   "password": ""
}

# jwt 设置
JWT_EXPIRE = 20000 # jwt token过期时间
JWT_SECRET_SALT = 'nPJM7dw' # jwt 加盐
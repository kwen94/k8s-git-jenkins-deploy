import json
from config import REDIS_CONFIG, INTERVAL
from api.redis_conn import RedisConn
from api.k8s import getK8sByEnv




my_redis = RedisConn(REDIS_CONFIG).poolConn()


def make_service_name_redis_key(service_name, env):
    return service_name + ':' + env

def setK8sCache(service_name, env, targetPods):
    key = make_service_name_redis_key(service_name, env)
    my_redis.set(key, json.dumps(targetPods), INTERVAL)

def getK8sCache(service_name, env):
    get_json = RedisConn.exists_get_json(my_redis)
    key = make_service_name_redis_key(service_name, env)
    value = get_json(key)
    if value:
        return value
    else:
        k8s_instance = getK8sByEnv(env)
        if k8s_instance:
            targetPods = k8s_instance.get_pod_list(service_name)
            setK8sCache(service_name, env, targetPods)
            return targetPods
        else:
            return False, "环境不支持"


def save_deploy_record(record):
    save_num = 9 # 保留多少个发布记录
    num = int(record['deploy_num'])
    s = my_redis.zrevrange("deploy_record", 0, -1)
    if s:
        max_record = json.loads(s[0])
        max_number = int(max_record['deploy_num'])

        # 因为jenkins项目号是从小到大，如果出现了redis中有序号比当前序号还大，说明是历史遗留数据
        # 此时应该删除比当前项目号还大的数据
        if max_number >= num:
            my_redis.zremrangebyscore("deploy_record", num, max_number)

        if num > save_num:
            # 只保留现在10个发布记录
            my_redis.zremrangebyscore("deploy_record", 0, num-save_num)

    # 插入新的发布记录
    my_redis.zadd("deploy_record", {json.dumps(record): num})
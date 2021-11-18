import json
from flask import g

from . import deploy_blueprint
from api.tag import app_tag
from api.git import GetCommitInfo
from api.my_jenkins import MyJenkins

from utils.utils import return_resp, auth_check
from utils.middleware import my_redis, getK8sByEnv, getK8sCache
from utils.utils import get_post_data
from config import JENKINS_USERNAME, JENKINS_PASSWORD, JENKINS_URL, JENKINS_PROJECT_NAME


# 获取历史发布记录
@deploy_blueprint.route('/get_history_deploy_record', methods=['GET'])
def get_history_deploy_record():
    s = my_redis.zrange("deploy_record", 0, -1)
    lst = []
    for i in s:
        lst.append(json.loads(i))
    return return_resp(lst)


@deploy_blueprint.route('/service/name_list', methods=['POST'])
@get_post_data
def service_name_list():
    env = g.data.get('env')
    k8s_instance = getK8sByEnv(env)
    if k8s_instance:
        service_list = k8s_instance.get_deployment_list('default')
        return return_resp(service_list)
    else:
        return return_resp("环境暂不支持", 101)


@deploy_blueprint.route('/service/tag_list', methods=['POST'])
@get_post_data
def service_tag_list():
    service_name = g.data.get('service_name')
    tag_list = app_tag.list(service_name)
    if tag_list is False:
        return return_resp("仓库中不存在该镜像", 102)
    return return_resp(tag_list)


@deploy_blueprint.route('/service/current_tag', methods=['POST'])
@get_post_data
def service_current_tag():
    service_name = g.data.get('service_name')
    env = g.data.get('env')

    k8s_instance = getK8sByEnv(env)
    if k8s_instance:
        tag = k8s_instance.get_deployment_image_tag(service_name, 'default')
        return return_resp(tag)
    else:
        return return_resp("环境暂不支持", 101)


@deploy_blueprint.route('/commit/detail', methods=['POST'])
@get_post_data
def commit_detail():
    service_name = g.data.get('service_name')
    tag = g.data.get('tag')
    commit_id = tag.split('-')[-1]
    commit_info, merge_url = GetCommitInfo(service_name, commit_id).get_mr_commits()

    if isinstance(commit_info, str):
        return {
            "code": 100,
            "data": {
                "commits": commit_info,
                "merge_url": merge_url
            }
        }
    else:
        return {
            "code": 0,
            "data": {
                "commits": commit_info,
                "merge_url": merge_url
            }
        }


@deploy_blueprint.route('/deploy/start', methods=['POST'])
@auth_check
@get_post_data
def deploy_start():
    service_name = g.data.get('serviceName')
    print('service_name', service_name)
    tag = g.data.get('tag')
    env = g.data.get('env')

    if not all((service_name, tag, env)):
        return return_resp("参数缺失", 990)

    jenkins = MyJenkins(JENKINS_URL, JENKINS_USERNAME, JENKINS_PASSWORD)
    params = {
        "ServiceName": service_name,
        "TAG": tag,
        "ENV": env
    }

    num = jenkins.make_build_obj(JENKINS_PROJECT_NAME, params)

    return {
            "code": 0,
            "data": num
        }


@deploy_blueprint.route('/pod/list', methods=['POST'])
@get_post_data
def deploy_list_pod():
    service_name = g.data.get('service_name')
    env = g.data.get('env')
    data = getK8sCache(service_name, env)
    if isinstance(data, tuple):
        return return_resp(data[1], 101)
    return return_resp(data)
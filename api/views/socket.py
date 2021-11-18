import requests
from flask_socketio import Namespace, emit
from web import socketio
from config import JENKINS_PASSWORD, JENKINS_USERNAME, JENKINS_URL, JENKINS_PROJECT_NAME
from  api.my_jenkins import MyJenkins
from utils.middleware import save_deploy_record


class JenkinsLogSocketIO(Namespace):
    def on_connect(self):
        print('client connected.')

    def on_disconnect(self):
        print('client disconnected.')

    def on_recv_deploy_record(self, message):
        num = message['deploy_num']
        # http://10.0.63.11:8080/job/%E5%8F%91%E5%B8%83%E6%B5%8B%E8%AF%95/105/console
        jenkins_url = JENKINS_URL + 'job/' + JENKINS_PROJECT_NAME + '/{}/console'.format(num)
        message['jenkins_url'] = jenkins_url
        save_deploy_record(message)
        emit("recv_deploy_record", message, broadcast=False)

    def on_deploy_status(self, number):
        url = '{}{}/{}/{}/'.format(JENKINS_URL, 'job', JENKINS_PROJECT_NAME, str(number))
        jenkins = MyJenkins(JENKINS_URL, JENKINS_USERNAME, JENKINS_PASSWORD)
        http_error_count = 0
        connection_error = 0
        while True:
            try:
                if http_error_count > 1 or connection_error > 10:
                    emit('deploy_status', {"number": number, "status": "ERROR"})
                    return

                status = jenkins.get_result(url, number, JENKINS_PROJECT_NAME)
                print('第一次获取: ', url, number, JENKINS_PROJECT_NAME, status)
                if status is None:
                    continue
            except requests.exceptions.ConnectionError:
                connection_error += 1
            except requests.exceptions.HTTPError:
                http_error_count += 1
            else:
                break
        emit('deploy_status', {"number": number, "status": status})

socketio.on_namespace(JenkinsLogSocketIO('/dcenter'))
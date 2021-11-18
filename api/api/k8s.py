import datetime
from kubernetes import client, config
from  config import DEV_KUBERNETES_FILE, PROD_KUBERNETES_FILE



def K8sObj2Dict(value):
    d = {}
    if value.running:
        running = value.running
        if running:
            d['running'] = {}
            d['running']["started_at"] = running.started_at.strftime('%Y-%m-%d %H:%M:%S')

    if value.terminated:
        terminated = value.terminated
        if terminated:
            d['terminated'] = {}
            d['terminated']["exit_code"] = terminated.exit_code
            d['terminated']["reason"] = terminated.reason
            d['terminated']["message"] = terminated.message

    if value.waiting:
        waiting = value.waiting
        if waiting:
            d['waiting'] = {}
            d['waiting']["message"] = waiting.message
            d['waiting']["reason"] = waiting.reason

    return d


class K8sBase:
    def get_deployment_list(self, namespace):
        ret = self.v1.list_namespaced_deployment(namespace, _request_timeout=4)
        deployments = []
        for item in ret.items:
            deployments.append(item.metadata.name)
        return deployments

    def get_deployment_image_tag(self, service_name, namespace):
        ret = self.v1.read_namespaced_deployment(service_name, namespace, _request_timeout=4)
        image = ret.spec.template.spec.containers[0].image
        tag = image.split(':')[-1]
        return tag

    def get_pod_list(self, serviceName):
        targetPods = []
        ret = self.core_v1.list_namespaced_pod('default', _request_timeout=4)
        for pod in ret.items:
            if pod.metadata.name.startswith(serviceName):
                d = {}
                d['name'] = pod.metadata.name
                d['image'] = pod.spec.containers[0].image
                d['start_time'] = (pod.status.start_time + datetime.timedelta(hours=+8)).strftime('%Y-%m-%d %H:%M:%S')
                containers_status = pod.status.container_statuses
                count = 0
                ready = 0
                for cs in containers_status:
                    count += 1
                    if cs.ready is True:
                        ready += 1

                    d["state"] = K8sObj2Dict(cs.state)
                d['ready'] = '{}/{}'.format(ready, count)
                targetPods.append(d)
        ret = self.v1.read_namespaced_deployment(serviceName, 'default', _request_timeout=4)
        replicas = ret.spec.replicas
        image = ret.spec.template.spec.containers[0].image
        return {
            "replicas": replicas,
            "image": image,
            "pod_list": targetPods
        }

class DevK8s(K8sBase):
    def __init__(self):
        config.kube_config.load_kube_config(config_file=DEV_KUBERNETES_FILE)
        self.v1 = client.AppsV1Api()
        self.core_v1 = client.CoreV1Api()


class ProdK8s(K8sBase):
    def __init__(self):
        config.kube_config.load_kube_config(config_file=PROD_KUBERNETES_FILE)
        self.v1 = client.AppsV1Api()
        self.core_v1 = client.CoreV1Api()

dev_k8s = DevK8s()
prod_k8s = ProdK8s()

def getK8sByEnv(env):
    if env == "dev":
        return DevK8s()
    elif env == "prod":
        return ProdK8s()
    else:
        return False
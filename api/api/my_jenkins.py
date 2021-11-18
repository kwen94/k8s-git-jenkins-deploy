import sys
import requests
from jenkinsapi.api import Jenkins
from jenkinsapi.build import Build




def print_color(s, color, exit=False):
    c = {
        'red': '31',
        'green': '32',
        'yellow': '33',
        'blue': '34'
    }
    print("\033[0;{};40m{}\033[0m\n".format(c.get(color, '37'), s))

    if exit:
        sys.exit(1)

class MyJenkins:
    def __init__(self, jenkins_url, jenkins_username, jenkins_password):
        self.server = Jenkins(jenkins_url, username=jenkins_username, password=jenkins_password, useCrumb=True, timeout=5)

    def make_build_obj(self, jenkins_project, jenkins_params):
        self.job = self.server[jenkins_project]
        run_job = self.job.invoke(build_params=jenkins_params)

        wait = True
        while wait:
            try:
                self.build = run_job.block_until_building(delay=3)
                wait = False
                print_color('Build start.............', 'yellow')
            except (requests.exceptions.ConnectionError):
                continue
            finally:
                return self.build._data['number']
    def get_stream_logs(self):
        return self.build.stream_logs()


    def get_result(self, url,  number, jenkins_project):
        b = Build(url, number, self.server[jenkins_project])
        b.block_until_complete(delay=5)
        return b.get_status()

    def get_stream_logs_for_number(self, number, jenkins_project):
        job = self.server[jenkins_project]
        build = job.get_build(number)
        return build.stream_logs()



url = 'http://10.0.63.11/'
token = 'basdsadsadsadsa'

import gitlab



class GetCommitInfo:
    def __init__(self, serviceName, merge_commid):
        self.info_lst = []
        self.serviceName = serviceName
        self.merge_commid = merge_commid
        gl = gitlab.Gitlab(url, token, timeout=3)
        projects = gl.projects.list(search=serviceName)
        if len(projects) > 1:
            # 查找到了多个gitlab项目
            self.info_lst.append("查找到了多个gitlab项目")
        elif len(projects) == 0:
            # print_head("<h3>ERROR: 没有查找到项目[{}], 可能因为ops账号对该项目没有读取权限！</h3>".format(serviceName))
            self.info_lst.append("没有查找到项目[{}], 可能因为ops账号对该项目没有读取权限！".format(serviceName))
        else:
            self.project = projects[0]
            self.mrs = self.project.mergerequests.list(state='merged', order_by='updated_at')

    def get_mr(self):
        for mr in self.mrs:
            sha = mr.merge_commit_sha[0:7]
            if sha == self.merge_commid:
                return mr

    def get_mr_commits(self):
        if len(self.info_lst) == 1:
            if isinstance(self.info_lst[0], str):
                return self.info_lst[0], None

        mr = self.get_mr()
        if not mr:
            return "根据此tagName没有查找到相关Merge", None
        merge_url = mr.web_url
        print(merge_url)
        commits = mr.commits()

        for commit in commits:
            link_url = merge_url
            commit_id = commit.short_id
            author_name = commit.author_name
            title = commit.title
            committed_date = commit.committed_date
            diff = commit.diff()
            # html中双引号转义为 &quot;
            new_diff = []
            for i in diff:
            #     i['diff'] = i['diff'].replace('"', "&quot;")
            #     i['diff'] = i['diff'].replace("'", "&apos;")
                new_diff.append(i)
            self.info_lst.append(dict(
               commit_id=commit_id,
                link_url=link_url,
               author_name=author_name,
               title=title,
                committed_date=committed_date,
                diff=new_diff
            ))
        return self.info_lst, merge_url







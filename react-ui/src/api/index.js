/*
要求: 能根据接口文档定义接口请求
包含应用中所有接口请求函数的模块
每个函数的返回值都是promise
*/

import ajax from './ajax'
import { message } from 'antd'
// import memoryUtils from '../utils/memoryUtils'

// const token = memoryUtils.user.token
const BASE = '/api/v1'


export const reqServiceNameList = (env) => ajax(BASE + '/deploy/service/name_list', {env}, 'POST')

export const reqTagList = (service_name) => ajax(BASE + '/deploy/service/tag_list', {service_name}, 'POST')

export const reqServiceCurrentTag = (env, service_name) => ajax(BASE + '/deploy/service/current_tag', {env, service_name}, 'POST')

export const reqDeployCommitDetail = (service_name, tag) => ajax(BASE + '/deploy/commit/detail', {service_name, tag}, 'POST')

export const reqStartDeploy = (serviceName, tag, env) => ajax(BASE + '/deploy/deploy/start', {serviceName, tag, env}, 'POST')

export const reqPodList = (service_name, env) => ajax(BASE + '/deploy/pod/list', {service_name, env}, 'POST')

export const reqHistoryDeployRecord = () => ajax(BASE + '/deploy/get_history_deploy_record', {}, 'GET')

export const reqLogin = (username, password) => ajax(BASE + '/login/', {username, password}, 'POST')

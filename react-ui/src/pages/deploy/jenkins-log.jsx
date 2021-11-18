import React, { Component } from 'react'
// import Websocket from 'react-websocket';
import { Tabs, Timeline, Tag, message} from 'antd';
import PubSub from 'pubsub-js'
import './jenkins-log.less'
import { reqHistoryDeployRecord } from '../../api/index'
import socket from '../../api/socket'
import memoryUtils from '../../utils/memoryUtils'



const { TabPane } = Tabs;

class JenkinsLog extends Component {

    state = {
        data: [],
        deploy_record: [],
        deploy_status: {},
    }

    send = (deploy_record) => {
        this.client.emit("recv_deploy_record", deploy_record)
    }

    getDeployStatus = (number) => {
        this.client.emit("deploy_status", number)
    }

    getHistoryDeployRecord = async () => {
        const result = await reqHistoryDeployRecord()
        if (result.code === 0) {
            let status = {}
            result.data.forEach((value) => {
                status[value.deploy_num] = 'UNKNONW'
            })

            this.setState({
                deploy_record: result.data,
                deploy_status: status
            })

            if(result.data){
                result.data.map((value, index) => {
                    if(status[value.deploy_num]==="UNKNONW"){
                        this.getDeployStatus(value.deploy_num)
                    }
                })
            }
        } else {
            message.error(`获取发布记录失败: ${result.data}`)
        }
    }

    componentDidMount() {

        
        if(memoryUtils.user.username){
            this.client = socket()
            console.log('已登录')
        }

        this.getHistoryDeployRecord()

        // 如果有发布记录，且状态为灰色(发布中)，就循环检测其状态
        this.timer = setInterval(() => {
            const {deploy_record, deploy_status} = this.state
            if(deploy_record){
                deploy_record.map((value, index) => {
                    if(deploy_status[value.deploy_num]==="UNKNONW"){
                        console.log("更新状态。。。", value.deploy_num)
                        this.getDeployStatus(value.deploy_num)
                    }
                })
            }
        }, 2000)

        this.client.on("recv_deploy_record", (data) => {
            let {deploy_record, deploy_status} = this.state
            deploy_record.push(data)
            deploy_status[data.deploy_num] = 'UNKNONW'
            this.setState({
                deploy_record,
                deploy_status
            })
        });

        this.client.on("deploy_status", (data) => {
            const number = data.number
            const status = data.status
            const {deploy_status} = this.state
            deploy_status[number] = status
            this.setState({
                deploy_status
            })
        });

        PubSub.subscribe('toDeploy', (topic, data) => {
            const deploy_num = data.data
            let deploy_record = {deploy_num:deploy_num, env: data.env, serviceName: data.serviceName,  tag: data.tag, time: data.time}            
            
            // 这里将数据传递给websocket服务端，等待服务端推送 记录和发布状态
            this.send(deploy_record)
        })
    }

    componentWillUnmount(){
        clearInterval(this.timer)
    }

    setColor = (data, index) => {
        if (data.indexOf("Finished: SUCCESS") !== -1) {
            return <h5 style={{ color: "green" }} key={index}>{data}</h5>
        } else if (data.indexOf("Finished: FAILURE") !== -1) {
            this.setState({
                percent: 100
            })
            return <div style="color:red" key={index}>{data}</div>
        } else {
            return <div key={index}>{data}</div>
        }
    }


    render() {
        const {deploy_record, deploy_status} = this.state
        return (
            <div className="jenkins-log-area">
                <Tabs className="jenkins-choice-tab" defaultActiveKey="1" >
                    <TabPane tab="构建记录" key="jenkins-log">
                        <div className="jenkins-log">
                            <Timeline reverse={true}>
                                {
                                    deploy_record.map((value, index) => (
                                        <Timeline.Item key={index} color={deploy_status[value.deploy_num]==='UNKNONW'?"gray":deploy_status[value.deploy_num]==='SUCCESS'?"green":deploy_status[value.deploy_num]==='ERROR'?"#ff00ff":"red"}><a href={value.jenkins_url}>#{value.deploy_num}</a> <Tag>{value.env}</Tag> <Tag>{value.serviceName}</Tag> <Tag>{value.tag}</Tag> <Tag>{value.time}</Tag></Timeline.Item>
                                    ))
                                }                   
                            </Timeline>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        )
    }

}

export default JenkinsLog
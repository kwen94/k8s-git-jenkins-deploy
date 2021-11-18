import React, { Component } from 'react'
import { Table, Popover, Tabs, Tag, message } from 'antd';
import PubSub from 'pubsub-js'
import './k8s-status.less'
import { fromCurrentTime } from '../../utils/utils'
import { reqPodList } from '../../api/index'

const { TabPane } = Tabs;

class K8sStatus extends Component {

    state = {
        data: [],
        percent: 0,
        status: "active",
        replicas: 0,
        image: "",
        pod_list: [],

        serviceName: undefined,
        env: undefined
    }


    getPodInfo = async (serviceName, env) => {
        const result = await reqPodList(serviceName, env)
        if (result.code === 0) {
                this.setState({
                    replicas: result.data.replicas,
                    image: result.data.image,
                    pod_list: result.data.pod_list
                })
        } else {
            message.error(`获取Pod列表失败`)
        }
    }

    componentDidMount() {

        PubSub.subscribe('K8sServiceNameUpdate', (topic, data) => {
            if(data.env!==undefined){
                this.getPodInfo(data.serviceName, data.env)
                this.setState({
                    serviceName: data.serviceName,
                    env: data.env
                })
            } else {
                this.setState({
                    replicas: 0,
                    image: "",
                    pod_list: [],

                    serviceName: undefined,
                    env: undefined
                })
            }
        })

        setInterval(() => {
            const {serviceName, env} = this.state
            if(serviceName){
                this.getPodInfo(serviceName, env)
            }
        }, 10000)
    }

    setColor = (data, index) => {
        if (data.indexOf("Finished: SUCCESS") !== -1) {
            return <h5 style={{ color: "green" }} key={index}>{data}</h5>
        } else if (data.indexOf("Finished: FAILURE") !== -1) {
            this.setState({
                percent: 100
            })
            return <div style={{color:"red"}} key={index}>{data}</div>
        } else {
            return <div key={index}>{data}</div>
        }

    }

    alreadyPodNum = () => {
        const {image, pod_list} = this.state
        let count = 0
        pod_list.map((item) => {
            if(item.image===image && item.state.running){
                count += 1
            }
        })
        return count
    }

    setTips = (data) => {
        const t = []
        
        data.map((value, index) => {
            t.push(value + '",')
            t.push(<br key={index} />)
        })

        return t
    }

    columns = [
        {
            title: '名称',
            dataIndex: 'name',
            render: (item, record) => (
                    <Popover color="cyan" placement="topLeft" title={this.setTips(JSON.stringify(record).split('",'))}>
                        {item}
                    </Popover>
                
            )
        },
        {
            title: '就绪',
            dataIndex: 'ready',
        },
        {
            title: '状态',
            dataIndex: 'state',
            render: (item) => (
                item.running ? "Running" : item.waiting ? item.waiting.reason : "Terminated"
            )
        },
        {
            title: '创建时间',
            dataIndex: 'start_time',
            render: (item) => (
                fromCurrentTime(item)
            )
        },
    ];


    render() {
        const { replicas, pod_list } = this.state
        return (
            <div className="k8s-log-area">
                <Tabs className="k8s-choice-tab" 
                    defaultActiveKey="1" 
                    tabBarExtraContent={{
                        right: <div><Tag color={replicas===0?"yellow":this.alreadyPodNum()===replicas?"green":"red"}>已更新/期望: {this.alreadyPodNum()}/{replicas}</Tag> <Tag color={this.state.replicas===0?"yellow":this.alreadyPodNum()===replicas===pod_list.length?"green":"red"}>当前总计: {pod_list.length}</Tag></div>,
                    }}
                    >
                    <TabPane tab="Deployment状态" key="k8s-log">
                        <div className="k8s-log">
                            <Table
                                columns={this.columns}
                                dataSource={pod_list}
                                pagination={false}
                                rowKey="name"
                                size="small" />
                        </div>
                    </TabPane>
                </Tabs>

            </div>

        )
    }

}

export default K8sStatus
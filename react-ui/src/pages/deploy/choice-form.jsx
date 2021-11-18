import React from 'react'
import PubSub from 'pubsub-js'
import { Form, Select, Button, Tag, message, Row, Col, Space, Spin} from 'antd';
import {
    ReloadOutlined,
} from '@ant-design/icons';

import { reqServiceNameList, reqTagList, reqServiceCurrentTag, reqStartDeploy } from '../../api/index'
import { dateFormat } from '../../utils/utils'
import './choice-form.less'


const { Option } = Select

// const envList = ['dev', 'test', 'green', 'prod']
const envList = ['dev', 'prod']

export default class ChoiceForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            serviceNameForSvg: undefined,
            reloadSvgColor: "gray",
            serviceNameList: [], // 每次请求当前环境的服务列表
            tagList: [],         // 每次请求之后获取镜像列表
            currentTag: "",      // 每次请求
            beforeTag: "",       // 每次请求
            loading: false,      // 部署按钮加载中
            svgLoading: false
        }
    }

    formRef = React.createRef()

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer)
        }
    }

    componentDidMount() {
        this.getServiceNameList()
        PubSub.subscribe('tabUpdate', (topic, data) => {
            this.setState({
                tagList: [],
                serviceNameForSvg: undefined,
                currentTag: "",      // 每次请求
                beforeTag: "",
            })
            if (this.timer) {
                clearInterval(this.timer)
            }
        })

        this.getBeforeEnv()

        this.props.saveFormRef(this.formRef, this.props.env)

    }

    toDeploy = async (serviceName, TAG, ENV) => {
        let date = new Date()
        const t = dateFormat("mm-dd HH:MM:SS", date)
        const result = await reqStartDeploy(serviceName, TAG, ENV)
        if (result.code === 0) {
            message.info("发布已成功提交！")
            PubSub.publish('toDeploy', { data: result.data, env: ENV, tag: TAG, serviceName: serviceName, time: t })
        } else {
            message.error(`发布失败: ${result.data}`)
        }
        this.setState({
            loading: false
        })
    }

    formValueUpdateHandle = (changedValues, allValues) => {

        const env = this.props.env

        for (var key in changedValues) {
            const value = changedValues[key]
            if (key === "serviceName") {
                this.serviceNameSelectOnChange(value)
            } else if (key === "tag") {
                const serviceName = allValues.serviceName
                this.serviceTagSelectOnChange(serviceName, value)
            }
        }
    }

    onFinish = (data) => {
        const serviceName = data.serviceName
        const ENV = this.props.env
        const TAG = data.tag
        message.info("发布正在提交！")

        this.setState({
            loading: true
        })

        this.toDeploy(serviceName, TAG, ENV)
    }

    updateTagValue = (value) => {
        this.formRef.current.setFieldsValue({
            'tag': value
        })
    }

    getBeforeEnv = () => {
        const { env } = this.props
        const index = envList.indexOf(env)
        let beforeEnv = ""
        if (index === 0) {
            // 当前环境是dev，没有上一个环境
            beforeEnv = null
        } else if (index !== -1) {
            beforeEnv = envList[index - 1]
        }

        this.setState({
            beforeEnv: beforeEnv
        })
    }

    getCurrentTag = async (serviceName) => {
        const { env } = this.props
        const result = await reqServiceCurrentTag(env, serviceName)
        if (result.code === 0) {
            this.setState({
                currentTag: result.data
            })
        } else {
            message.error(`获取当前Tag失败: ${result.data}`)
        }

        const index = envList.indexOf(env)
        if (index === 0) {
            // 当前环境是dev，没有上一个环境
            this.setState({
                beforeTag: "None",
            })
        } else if (index !== -1) {
            const beforeEnv = envList[index - 1]

            const result2 = await reqServiceCurrentTag(beforeEnv, serviceName)
            if (result2.code === 0) {
                this.setState({
                    beforeTag: result2.data,
                })
            } else {
                message.error(`获取上一个环境的Tag失败: ${result2.data}`)
            }
        }
    }

    serviceTagSelectOnChange = (serviceName, tag) => {

        if (tag === undefined || "") {
            this.setState({
                tagList: []
            })
        }
        PubSub.publish('commitTableUpdate', { serviceName: serviceName, tag: tag })
    }

    getTagListUpdateForSvg = (value) => {
        this.timer = setInterval(async () => {
            const { tagList } = this.state
            
            if (value) {
                const result = await reqTagList(value)
                if (result.code === 0) {
                    console.log('value', value, 'tagList', tagList, 'result.data', result.data)

                    if (tagList.toString() != result.data.toString()) {
                        console.log('value', value, 'tagList', tagList, 'result.data', result.data)
                        this.setState({
                            reloadSvgColor: "red"
                        })
                    }
                }
            }
        }, 4000)
    }

    serviceNameSelectOnChange = (value) => {

        if (value === undefined) {
            this.setState({
                tagList: [],
                currentTag: "",
                beforeTag: "",
                reloadSvgColor: "gray"
            })
            this.updateTagValue(undefined)
            PubSub.publish('commitTableUpdate', { serviceName: undefined, tag: undefined })
            PubSub.publish('K8sServiceNameUpdate', { serviceName: undefined, env: undefined })
            clearInterval(this.timer)

        } else {
            this.setState({
                reloadSvgColor: "gray"
            })
            this.getTagList(value)
            this.getCurrentTag(value)
            PubSub.publish('K8sServiceNameUpdate', { serviceName: value, env: this.props.env })
            clearInterval(this.timer)
            this.getTagListUpdateForSvg(value)
        }
        this.setState({
            serviceNameForSvg: value
        })
    }

    getServiceNameList = async () => {
        const result = await reqServiceNameList(this.props.env)
        if (result.code === 0) {
            this.setState({
                serviceNameList: result.data
            })
        } else {
            message.error(`获取服务列表失败: ${result.data}`)
        }
    }

    getTagList = async (serviceName) => {

        const result = await reqTagList(serviceName)
        if (result.code === 0) {
            this.setState({
                tagList: result.data,
            }, () => {
                this.updateTagValue(result.data[0])
            })
            PubSub.publish('commitTableUpdate', { serviceName, tag: result.data[0] })
        } else {
            message.error(`获取Tag列表失败: ${result.data}`)
            PubSub.publish('commitTableUpdate', { serviceName: undefined, tag: undefined })
        }
    }

    tailLayout = {
        wrapperCol: { offset: 0, span: 16 },
    };

    formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 15 },
        // labelCol: { span: 4 },
        // wrapperCol: { span: 14 },
    };

    reloadSvgOnClick =  async() => {

        this.setState({
            svgLoading: true
        })
        const {serviceNameForSvg} = this.state
        
        const result = await reqTagList(serviceNameForSvg)
        if (result.code === 0) {
            this.setState({
                tagList: result.data,
                reloadSvgColor: "gray"
            }, () => {
                this.updateTagValue(result.data[0])
            })
            message.info("刷新镜像列表成功！")
            PubSub.publish('commitTableUpdate', { serviceName:serviceNameForSvg, tag: result.data[0] })
        } else {
            message.error(`获取Tag列表失败: ${result.data}`)
            // PubSub.publish('commitTableUpdate', { serviceName: undefined, tag: undefined })
        }

        this.setState({
            svgLoading: false
        })
    }

    render() {
        const { loading, serviceNameList, tagList, beforeEnv, serviceNameForSvg, reloadSvgColor, svgLoading} = this.state

        let { currentTag, beforeTag } = this.state
        if (!currentTag) {
            currentTag = "先选择应用"
        }
        if (!beforeTag) {
            beforeTag = "先选择应用"
        }

        return (
            <Form
                name="form"
                className="ChoiceForm"
                {...this.formItemLayout}
                onFinish={this.onFinish}
                width={300}
                onValuesChange={this.formValueUpdateHandle}
                ref={this.formRef}
            >

                <Row gutter={[0, 0]} justify={'star'} >
                    <Col span={23}  >
                        <Form.Item name="serviceName" label="应用名称"
                            rules={[{ required: true, message: "服务名为首选项、必选项" }]}
                        >
                            <Select
                                placeholder="选择或搜索应用"
                                style={{ width: 220 }}
                                showSearch
                                allowClear
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {
                                    serviceNameList.map((value, index) => (
                                        <Option value={value} key={index}>{value}</Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                    </Col>

                </Row>

                <Row gutter={[0, 0]} justify={'start'} >
                    <Col span={23}  >
                        <Form.Item label="镜像版本"
                            required={true}

                        >
                            <Space>
                                <Form.Item name="tag"
                                    rules={[{ message: "TagName为首选项、必选项" }]}
                                    noStyle
                                >
                                    <Select placeholder="默认选择最新的Tag" style={{ width: 220 }}>
                                        {
                                            tagList ? tagList.map((value, index) => (
                                                <Option value={value} key={index}>{value}</Option>
                                            )) : undefined
                                        }
                                    </Select>
                                </Form.Item>

                                <Form.Item>
                                    {
                                        svgLoading==true?<Spin size="small" style={{position: "relative", top: 5}}/>:serviceNameForSvg != undefined ? <div className="ReloadOutlined"  >
                                            <svg onClick={this.reloadSvgOnClick} color={reloadSvgColor} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cloud-arrow-down" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708l2 2z" />
                                                <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
                                            </svg>
                                        </div> : null
                                    }
                                </Form.Item>

                            </Space>
                        </Form.Item>
                    </Col>
                </Row>



                <Row gutter={[0, 0]} justify={'star'} >
                    <Col span={23}  >
                        <Form.Item label="当前Tag" >
                            <Tag color="green">{currentTag}</Tag>
                        </Form.Item>
                    </Col>
                </Row>




                {
                    beforeEnv !== null ? <Row gutter={[0, 0]} justify={'star'} >
                        <Col span={23}  >
                            <Form.Item label={`${beforeEnv} Tag`}> <Tag color="red">{beforeTag}</Tag></Form.Item>
                        </Col>
                    </Row>
                        : null
                }

                {/* <Form.Item label="开发Tag">
                    <Tag color="red">{beforeTag}</Tag>
                </Form.Item> */}

                <Row gutter={[0, 0]} justify={'star'} >
                    <Col span={23}  >
                        <Form.Item wrapperCol={{ span: 10, offset: 6 }} className="deploy-button">
                            <Button type="primary" htmlType="submit" loading={loading} >{loading ? "提交中..." : "发布"}</Button>
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        )
    }


}
import React from 'react'
import { Tabs } from 'antd';
import PubSub from 'pubsub-js'

import ChoiceForm from './choice-form'
import './choice.less'


const { TabPane } = Tabs;




export default class Choice extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            formRef: {}, // Form对象的引用
        }
    }

    saveFormRef = (form, env) => {
        let { formRef } = this.state
        console.log("收到子组件传来的formRef", form, env);
        console.log("当前保存的formRef列表", formRef);


        formRef[env] = form

        if(form.current){
            this.setState({
                formRef: formRef
            })
        }
    }

    componentDidMount(){

    }


    tabOnChange = (value) => {
        console.log("显示所有的formRef", this.state.formRef)

        PubSub.publish('K8sServiceNameUpdate', { serviceName: undefined, env: undefined })
        PubSub.publish('commitTableUpdate', { serviceName: undefined, tag: undefined })

        PubSub.publish('tabUpdate', {})

        Object.values(this.state.formRef).forEach(element => {
            console.log("重置form")
            element.current.setFieldsValue({
                'serviceName': undefined,
                'tag': undefined,
            })
        });
        
    }

    render() {
        return (
            <div className="choice">
                <Tabs className="choice-tab" defaultActiveKey="dev" onChange={(value) => {
                    this.tabOnChange(value)
                }}>
                    <TabPane tab="开发环境" key="dev">
                        <ChoiceForm env="dev" saveFormRef={this.saveFormRef}/>
                    </TabPane>

                    <TabPane tab="生产环境" key="prod">
                        <ChoiceForm env="prod" saveFormRef={this.saveFormRef}/>
                    </TabPane>
                </Tabs>

            </div>

        )
    }
}

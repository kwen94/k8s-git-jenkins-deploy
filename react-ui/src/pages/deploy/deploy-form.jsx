import React, { Component } from 'react'
import { Row, Col, Layout } from 'antd';
import Choice from './choice'
import './index.less'

import NestedTable from './commits'
import JenkinsLog from './jenkins-log'
import K8sStatus from './k8s-status'


export default class DeployForm extends Component {

    state = {
        tabData: []
    }

    componentDidMount() {
    }

    render() {
        return (
            <Layout style={{ height: '100%' }}>

                <Row gutter={5}>
                    <Col className="gutter-row" span={8}>
                        <div className="deploy-choice">
                            <Choice />
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div className="deploy-log">
                            <JenkinsLog />
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div className="k8s-log">
                            <K8sStatus />
                        </div>
                    </Col>
                </Row>

                <Row gutter={16}>
                        <Col className="gutter-row" span={24}>
                            <div className="commit-record">
                            <NestedTable/>
                            </div>
                        </Col>
                </Row>
            </Layout>
        )
    }
}
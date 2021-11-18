import React, { Component } from 'react'
import { Layout, message } from 'antd';
import { Route, Switch, Redirect } from 'react-router-dom'

import LeftNav from '../../components/left-nav/left-nav'
import DeployForm from '../deploy/deploy-form'
// import MyBreadcrumb from '../../components/breadcrumb/breadcrumb'
import Header from '../../components/header/header'

import { reLogin } from '../../utils/utils'


// const LeftNav = React.lazy(() => import('../../components/left-nav/left-nav'));
// const Pod = React.lazy(() => import('../k8s/pod'));
// const LogApp = React.lazy(() => import('../log/app'));

import './admin.less'

const { Sider, Content } = Layout;


// 登录的路由组件
export default class Admin extends Component {
    constructor(props) {
        super(props)
        this.state = {
            collapsed: true
        }
    }

    render() {

        reLogin() // 判断是否需要重新登录

        return (
            <Layout style={{height: '100%'}}>
                <Sider>
                    <LeftNav />
                </Sider>
                    <Layout>
                        <Header toggle={this.toggle} collapsed={this.state.collapsed}/>

                        <Content className='content'>
                        {/* <MyBreadcrumb /> */}
                            <Switch>
                                <Route path='/deploy' component={DeployForm} />
                                <Redirect to='/deploy' />
                            </Switch>
                        </Content>
                        {/* <Footer style={{textAlign: 'center', color: '#ccc'}}>司南宝</Footer> */}
                    </Layout>
            </Layout>

            // <h2>777</h2>
        )
    }
}
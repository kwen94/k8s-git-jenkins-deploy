import React, { Component } from 'react'
import logo from '../../assets/images/logo.png'
import { message } from 'antd'

import {reqLogin} from '../../api/index'
import './index.less'


import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'

export default class Login extends Component {

    state = {
        username: "",
        password: "",
        disabled: false,
    }

    login = async (username, password) => {
        const result = await reqLogin(username, password)
        if(result.code!==0){
            message.error(`登录失败：${result.data}`)
        } else {
            message.info("登录成功！")
            // 开始加载信息到内存中和localStorage中
            memoryUtils.user = result.data // 保存在内存中
            storageUtils.saveUser(result.data ) // 保存在local中
            this.props.history.replace('/') // 跳转到后台管理界面(不需要再回退到登录所以用replace, 需要回退则使用push)

        }
    }

    handleButtonClick = (event) => {
        
        event.preventDefault()
        this.setState({
            disabled: true
        })

        const { username, password } = this.state
        this.login(username, password)

        this.setState({
            disabled: false
        })
    }

    handleUsernameChange = (value) => {
        const username = value.target.value
        this.setState({username})
    }

    handlePasswordChange = (value) => {
        const password = value.target.value
        this.setState({password})
    }

    render() {
        const {username, password, disabled} = this.state
        return (
            <section className="h-100">
                <div className="container h-100">
                    <div className="row justify-content-md-center h-100">
                        <div className="card-wrapper">
                            <div className="brand">
                                <img src={logo} alt="logo" />
                            </div>
                            <div className="card fat">
                                <div className="card-body">
                                    <h4 className="card-title">发布平台登录</h4>
                                    <form method="POST" className="my-login-validation" noValidate="">
                                        <div className="form-group">
                                            <label htmlFor="email">Username</label>
                                            <input id="email"  type="text" className="form-control" name="email" min="5" required autoFocus value={username} onChange={(e) => {this.handleUsernameChange(e)}}></input>
                                            <div className="invalid-feedback">Email is invalid</div></div>
                                        <div className="form-group">
                                            <label htmlFor="password">Password
                                                {/* <a href="forgot.html" className="float-right">Forgot Password?</a> */}
                                            </label>
                                            <input id="password" type="password" className="form-control" name="password" required data-eye value={password} onChange={(e) => {this.handlePasswordChange(e)}}></input>
                                            <div className="invalid-feedback">Password is required</div></div>
                                        <div className="form-group">
                                            <div className="custom-checkbox custom-control">
                                                <input type="checkbox" name="remember" id="remember" className="custom-control-input"></input>
                                                <label htmlFor="remember" className="custom-control-label">Remember Me</label>
                                            </div>
                                        </div>
                                        <div className="form-group m-0">
                                            <button type="submit" disabled={disabled} className="btn btn-primary btn-block" onClick={this.handleButtonClick}>Login</button>
                                        </div>
                                        {/* <div className="mt-4 text-center">Don't have an account?
                                            <a href="register.html">Create One</a>
                                        </div> */}
                                    </form>
                                </div>
                            </div>
                            <div className="footer">Copyright &copy; 2021 &mdash; kkwen.cn</div></div>
                    </div>
                </div>
            </section>
        )
    }


}
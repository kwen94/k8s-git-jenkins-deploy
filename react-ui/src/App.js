import React, { Component } from 'react'
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom'

import Admin from './pages/admin/admin';
import Login from './pages/login/login'



export default class App extends Component {

    render() {
        // const store = this.props.store
        return (
            <BrowserRouter>
                <Switch> {/* 只匹配其中一个 */}
                    
                    <Route path='/login' component={Login}></Route>
                    <Route path='/' component={Admin}></Route>
                    {/* <Redirect to='/' /> */}
                </Switch>
            </BrowserRouter>
        )
    }
}


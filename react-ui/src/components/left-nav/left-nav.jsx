import React, { Component} from 'react'
import { Menu } from 'antd';
import { Link, withRouter } from 'react-router-dom'

import logo from '../../assets/images/logo.png'
import menuList from '../../config/menuConfig'
import './index.less'


const { SubMenu } = Menu;

class LeftNav extends Component {

  getMenuNodes_map = (menuList) => {
    // 根据menu的数据数组生产对应的标签数组
    // 使用map() + 递归调用
    return menuList.map(item => {

        if (!item.children) {
            return (
                <Menu.Item key={item.key}>
                    <Link to={item.key}>
                        {/* <Icon type={item.icon} /> */}
                        <span>{item.title}</span>
                    </Link>
                </Menu.Item>
            )
        } else {
            return (
                <SubMenu
                key={item.key}
                title={
                    <span>
                        {/* <Icon type={item.icon} /> */}
                        <span>{item.title}</span>
                    </span>
                }
            >
                {this.getMenuNodes(item.children)}
            </SubMenu>
            )
        }
    })
}

getMenuNodes = (menuList) => {

    // 得到当前请求的路由路径
    const path = this.props.location.pathname

    // 根据menu的数据数组生产对应的标签数组
    // 使用reducr() + 递归调用
    return menuList.reduce((pre, item) => {
        // 向pre中添加<Menu.Item>
        // 向pre中添加<SubMenu>
        if(!item.children) {
            pre.push(
                <Menu.Item key={item.key}>
                <Link to={item.key}>
                    {/* <Icon type={item.icon} /> */}
                    <span>{item.title}</span>
                </Link>
            </Menu.Item>
            )
        } else {
            // 查找一个与当前请求路径匹配的子Item
            const cItem = item.children.find(cItem => cItem.key===path)
            // 如果存在,说明当前item的子列表需要打开
            if(cItem) {
                this.openKey = item.key
                // let menuKeys = this.props.location.pathname.split('/')
                // console.log("openKey", item.key)
                // console.log(1111111111, menuKeys.pop())
                // console.log(22222222, menuKeys.join('/'))
            }

            pre.push(
                <SubMenu
                key={item.key}
                title={
                    <span>
                        {/* <Icon type={item.icon} /> */}
                        <span>{item.title}</span>
                    </span>
                }
            >
                {this.getMenuNodes(item.children)}
            </SubMenu>
            )
        }

        return pre
    }, [])
} 

// 在第一次render()之前
// 为第一次render()准备数据(同步的)
UNSAFE_componentWillMount() {
    this.menuNodes = this.getMenuNodes(menuList)
}

render() {

    // 得到当前请求路径
    const path = this.props.location.pathname
    let openKey = this.openKey

    return (
        <div className='left-nav'>
            <Link to='/' className='left-nav-header'>
                <img src={logo} alt='logo' />
                <h1>Deploy</h1>
            </Link>

            <Menu
                mode="inline"
                theme="dark"
                selectedKeys={[path]}
                defaultOpenKeys={[openKey]}
                defaultSelectedKeys={[openKey]}

            >
                {
                    this.menuNodes
                }

            </Menu>
        </div>

    )
}



}


export default withRouter(LeftNav)
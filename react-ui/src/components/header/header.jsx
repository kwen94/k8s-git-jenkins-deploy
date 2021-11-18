import React, {Component} from 'react'
import { withRouter } from 'react-router-dom'
import { Modal, Button } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';


import  memoryUtils from '../../utils/memoryUtils'
// import  torageUtils from '../../utils/storageUtils'
// import menuList from '../../config/menuConfig.js'
import LinkBotton from '../link-button/'


import './index.less'


const { confirm } = Modal;


// 左侧导航的组件
class Header extends Component {

    // state = {
    //     currentTime: formatDate(Date.now()), //当前时间字符串格式
    //     dayPictureUrl: '',  //天气图片url
    //     weather: '', // 天气的文本
    // }

    // getTime = () => {
    //     // 每隔 1s获取当前时间，并更新状态数据currentTime
    //     this.intervalId = setInterval(() => {
    //         const currentTime = formatDate(Date.now())
    //         this.setState({currentTime})
    //     }, 1000);
    // }

    // getWeather = async () => {
    //     const {dayPictureUrl, weather}  = await reqWeather('上海')
    //     this.setState({dayPictureUrl, weather})
    // }

    // getTitle = () => {
    //     // 得到当前请求路径
    //     const path = this.props.location.pathname

    //     let title

    //     menuList.forEach(item => {
    //         if (item.key ===path) { // 如果当前item对象的key与path一样，item的title就是需要显示的title
    //             title = item.title
    //         } else if (item.children) {
    //             const cItem = item.children.find(cItem => cItem.key===path)
    //             if (cItem) {
    //                 title = cItem.title
    //             }
    //         }
    //     })

    //     return title
    // }

    // 退出登录
    logout = () => {
        // 显示确认框
        confirm({
            // icon: <ExclamationCircleOutlined />,
            content: '确认退出吗？',
            onOk: () => {
                // 删除保存的user数据
                // torageUtils.removeUser()
                // memoryUtils.user = {}
                // 跳转到login界面
                this.props.history.replace('/login')
            },
            onCancel() {
                console.log('Cancel');
            },
            });

    }

    // 第一次在render()之后执行一次， 一般在此执行异步操作： 发ajax请求/启动定时器
    // componentDidMount() {
    //     this.getTime()
    //     this.getWeather()
    // }

    // componentWillUnmount = () => {
    //     // 清除定时器
    //     clearInterval(this.intervalId)
    // }

    render() {
        // const {dayPictureUrl, weather, currentTime} = this.state

        const username = memoryUtils.user.username
        // const user_name = "司南宝"
        // 得到当前需要显示的title
        // const title = this.getTitle()

        return (
            <div className="header-top">
                <div className="header-div">
                    {/* <Icon
                        className="trigger"
                        type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
                        onClick={this.props.toggle}
                        /> */}
                    <MenuUnfoldOutlined className="trigger" />
                    
                    <span>Hi,  {username}</span>
                </div>

                <Button type="primary" className="header-button" onClick={this.logout}>退出</Button>
            </div>
        )
    }
}


export default withRouter(Header)
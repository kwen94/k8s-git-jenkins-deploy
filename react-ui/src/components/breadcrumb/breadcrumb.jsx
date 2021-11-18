import React from 'react'
import { Breadcrumb } from 'antd';
import { withRouter } from 'react-router-dom'
import menuList from '../../config/menuConfig.js'

import './breadcrumb.less'



let getTitle = (path) => {

    let title = []

    console.log('mmm', menuList)

    menuList.forEach(item => {
        if (item.key===path) { // 如果当前item对象的key与path一样，item的title就是需要显示的title
            title.push(item.title)
        } else if (item.children) {
            const cItem = item.children.find(cItem => cItem.key===path)
            if (cItem) {
                title.push(item.title)
                title.push(cItem.title)
            }
        }
    })
    return title
}


function MyBreadcrumb (props) {

    const path = props.location.pathname
    console.log('props.location.pathname', path)
    console.log('getTitle(path)', getTitle(path))

    const title = getTitle(path)

    if(title.length===1 && title[0]==='首页'){
        return (
            <Breadcrumb className='breadcrumb'>
                <Breadcrumb.Item className="breadcrumb-first">
                    首页
                </Breadcrumb.Item>     
          </Breadcrumb>
        )
    }

    return (
        <Breadcrumb className='breadcrumb'>
            <Breadcrumb.Item className="breadcrumb-first">
                首页
            </Breadcrumb.Item>

            {title.map((subItem, index) => 
                <Breadcrumb.Item key={index}>
                    {subItem}
                </Breadcrumb.Item>
            )}
            
      </Breadcrumb>
    )




}


export default withRouter(MyBreadcrumb)

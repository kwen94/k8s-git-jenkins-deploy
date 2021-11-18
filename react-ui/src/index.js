import React from "react";
import ReactDOM from "react-dom";

import 'antd/lib/row/style';
import 'antd/lib/col/style';
import App from './App'
import storageUtils from './utils/storageUtils'
import memoryUtils from './utils/memoryUtils'

// 读取local中保存的user, 保存到内存中
const user = storageUtils.getUser()
memoryUtils.user = user

ReactDOM.render(<App/>, document.getElementById('root'))

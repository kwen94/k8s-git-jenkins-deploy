import memoryUtils from './memoryUtils'
import { message } from 'antd'


export function fromCurrentTime(dateString) {
	console.debug('dateString', dateString, (String(dateString)).length)
	var timestamp1;
	if ((String(dateString)).length > 12) {
	    //“2020-08-10 18:29:24”的字符长度是19，超过了，所以直接进入时间戳的处理里面
		//判断时间戳是否为毫秒单位（不少于13位）或者字符串2020-08-10 18:29:24长度
		timestamp1 = Date.parse(new Date(dateString));
	} else {
		// 时间戳单位是秒，所以需要*1000变成毫秒的单位
		timestamp1 = parseInt(dateString) * 1000;
	}
	let date = new Date(timestamp1).getTime();
	let currentDate = new Date().getTime();
	let spaceTime = Math.abs(currentDate - date) / 1000; //把相差的毫秒数转换为秒数
	if (spaceTime < 60) {
		// 间隔时间小于1分钟，返回分钟数
		return '刚刚';
	}
	if (spaceTime < 3600) {
		// 间隔时间小于1小时，并且上面的条件都达不到， 返回分钟数
		let time = parseInt(spaceTime / 60)
		return time + '分钟前';
	} else if (spaceTime < 86400) {
		// 间隔时间小于1天，并且上面的条件都达不到，返回小时数
		let time = parseInt(spaceTime / 60 / 60);
		return time + '小时前';
	} else if (spaceTime < 172800) {
		// 间隔时间小于2天，并且上面的条件都达不到，返回昨天
		let time = parseInt(spaceTime / 60 / 60 / 24);
		return '昨天';
	} else {
		// 间隔时间大于2天，并且上面的条件都达不到，返回天数
		let time = parseInt(spaceTime / 60 / 60 / 24);
		return time + '天前';
	}
}



export function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

export const reLogin = () => {
	if(Object.keys(memoryUtils.user).length === 0){
		message.info("身份信息已过期，请重新登录")
		window.location.replace('/login')
	}
	else if(Date.parse(new Date())/1000 > memoryUtils.user.expire){
		window.location.replace('/login')
		message.info("身份信息已过期，请重新登录")
	} 
}

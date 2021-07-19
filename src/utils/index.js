import Vue from 'vue'
import router from '@/router'
import store from '@/store'

/**
 * 获取uuid
 */
export function getUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    return (c === 'x' ? (Math.random() * 16 | 0) : ('r&0x3' | '0x8')).toString(16)
  })
}

/**
 * 是否有权限
 * @param {*} key
 */
export function isAuth(key) {
  return JSON.parse(sessionStorage.getItem('permissions') || '[]').indexOf(key) !== -1 || false
}

/**
 * 树形数据转换
 * @param {*} data
 * @param {*} id
 * @param {*} pid
 */
export function treeDataTranslate(data, id = 'id', pid = 'parentId') {
  var res = []
  var temp = {}
  for (var i = 0; i < data.length; i++) {
    temp[data[i][id]] = data[i]
  }
  for (var k = 0; k < data.length; k++) {
    if (temp[data[k][pid]] && data[k][id] !== data[k][pid]) {
      if (!temp[data[k][pid]]['children']) {
        temp[data[k][pid]]['children'] = []
      }
      if (!temp[data[k][pid]]['_level']) {
        temp[data[k][pid]]['_level'] = 1
      }
      data[k]['_level'] = temp[data[k][pid]]._level + 1
      temp[data[k][pid]]['children'].push(data[k])
    } else {
      res.push(data[k])
    }
  }
  return res
}
/**
 *时间格式化年月日
 */
export function myTime(value) {
  let date = new Date(value)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  month = month > 9 ? month : ('0' + month)
  let day = date.getDate()
  day = day > 9 ? day : ('0' + day)
  let hh = date.getHours()
  hh = hh > 9 ? hh : ('0' + hh)
  let mm = date.getMinutes()
  mm = mm > 9 ? mm : ('0' + mm)
  let ss = date.getSeconds()
  ss = ss > 9 ? ss : ('0' + ss)
  let time = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
  return time
}

export function myTimeS(value) {
  let date = new Date(value)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  month = month > 9 ? month : ('0' + month)
  let day = date.getDate()
  day = day > 9 ? day : ('0' + day)
  let time = year + '-' + month + '-' + day
  return time
}
export function countDown(Time) {
  var nowTime = +new Date(); //当前时间的时间戳
  var inputTime = +new Date(Time); // 传进来时间的时间戳
  var times = (inputTime - nowTime) / 1000; // times为剩余时间（倒计时）秒数
  var d = parseInt(times / 60 / 60 / 24); // 倒计时多少天
  // d = d < 10 ? '0' + d : d; // 三元运算符判断天数是否小于10，小于的话在前边加个0（为了看起来不别扭）
  var h = parseInt(times / 60 / 60 % 24); // 倒计时多少小时
  h = h < 10 ? '0' + h : h;
  var m = parseInt(times / 60 % 60); // 倒计时多少分钟
  m = m < 10 ? '0' + m : m;
  var s = parseInt(times % 60); // 倒计时多少秒
  s = s < 10 ? '0' + s : s;
  if (d <= 0) {
    return h + '时' + m + '分' + s + '秒';
  } else {
    return d + '天' + h + '时' + m + '分' + s + '秒';
  }
}


/**  导入导出基地址  */
export let baseUrl = 'https://58hongren.com/renren-fast'
/**
 * https://58hongren.com/renren-fast
 * http://47.111.107.98:9000/renren-fast
 * http://192.168.110.185:9000/renren-fast
 */
/**
 * 清除登录信息
 */
export function clearLoginInfo() {
  Vue.cookie.delete('token')
  store.commit('resetStore')
  router.options.isAddDynamicMenuRoutes = false
}

// 云函数入口文件
const cloud = require('wx-server-sdk')
var request = require('request')
const got = require('got')
var rp = require('request-promise')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let postResponse = await got(event.URL, {
    method: 'GET', //post请求
    headers: {
      'Content-Type': 'application/json',
      'Cookie':event.Cookie
    }
  })
  var data = postResponse.body.replace(/[\r\n|\t]/g, '')
  return data.match(/id="xqkb".*class="main-tit-b"/g)[0]//返回数据
}
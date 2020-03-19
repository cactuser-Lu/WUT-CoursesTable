// 云函数入口文件
const cloud = require('wx-server-sdk')
var request = require('request')
const got = require('got')
var rp = require('request-promise')

cloud.init({ env: 'wut-classtable-umngq'})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(event)
  let postResponse = await got(event.URL, {
    method: 'POST', //post请求
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return postResponse.headers//返回数据
}
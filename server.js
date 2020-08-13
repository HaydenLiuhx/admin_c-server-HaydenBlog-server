/*
应用的启动模块
1. 通过express启动服务器
2. 通过mongoose连接数据库
  说明: 只有当连接上数据库后才去启动服务器
3. 使用中间件
 */
const mongoose = require('mongoose')
const express = require('express')
const app = express() // 产生应用对象

// 声明使用静态中间件
app.use(express.static('public'))
// 声明使用解析post请求的中间件
app.use(express.urlencoded({extended: true})) // 请求体参数是: name=tom&pwd=123
app.use(express.json()) // 请求体参数是json结构: {name: tom, pwd: 123}
// 声明使用解析cookie数据的中间件
const cookieParser = require('cookie-parser')
app.use(cookieParser())
// 声明使用路由器中间件
const indexRouter = require('./index')
app.use('/', indexRouter)  //

const fs = require('fs')


// 通过mongoose连接数据库
mongoose.connect('mongodb://localhost:27017/react-backend', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log('Connect to db successfully!!!')
    // Only start after connect
    app.listen('4000', () => {
      console.log('Server start, Please visit -> http://localhost:4000')
    })
  })
  .catch(error => {
    console.error('fail to connect db', error)
  })
  mongoose.set('useFindAndModify', false);


// app.listen(4000,() => {
//     console.log('http://localhost:4000')
// })
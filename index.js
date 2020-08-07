const express = require('express')
//const app = express()
//const jwt = require('jsonwebtoken')
const UserModel = require('./Usermodels')
const mongoose = require('mongoose')
const md5 = require('blueimp-md5')
//const SECRET = 'Hayden'
// 得到路由器对象
const router = express.Router()

//app.use(express.json())
router.get('/api/users', async (req, res) => {
    try{
    const users = await UserModel.find()
    //res.send({status: 0, data: {users, roles}})
    res.send({status: 0, data: users})
    } catch {
        (error => {
        console.error('获取用户列表异常', error)
        res.send({status: 1, msg: '获取用户列表异常, 请重新尝试'})
      })

    }
})

router.post('/api/register', async (req, res) => {
    const user = await UserModel.create({
        username: req.body.username,
        password: req.body.password
    })
    //console.log(req.body)
    res.send(user)
})

router.post('/api/login', async (req, res) => {
    //check user isavailable?
    try {
        const { username, password } = req.body
        // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
        UserModel.findOne({ username, password: md5(password) })
            .then(user => {
                if (user) { // 登陆成功
                    // 生成一个cookie(userid: user._id), 并交给浏览器保存
                    res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 })
                    if (user.role_id) {
                        RoleModel.findOne({ _id: user.role_id })
                            .then(role => {
                                user._doc.role = role
                                console.log('role user', user)
                                res.send({ status: 0, data: user })
                            })
                    } else {
                        user._doc.role = { menus: [] }
                        // 返回登陆成功信息(包含user)
                        res.send({ status: 0, data: user })
                    }

                } else {// 登陆失败
                    res.send({ status: 1, msg: '用户名或密码不正确!' })
                }
            })
    } catch { (error => {
        console.error('登陆异常', error)
        res.send({ status: 1, msg: '登陆异常, 请重新尝试' })
    })
}
})



// router.get('/api/profile', async (req, res) => {
//     res.send(req.user)
// })

// app.get('api/orders', async (req,res) => {
//     const orders = await Order.find().where({
//         user: req.user._id
//     })
//     res.send(orders)
// })

module.exports = router
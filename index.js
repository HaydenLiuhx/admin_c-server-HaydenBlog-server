const express = require('express')
//const app = express()
//const jwt = require('jsonwebtoken')
const UserModel = require('./Usermodel')
const CategoryModel = require('./Categorymodel')
const ProductModel = require('./Productmodel')
const RoleModel = require('./Rolemodel')

const mongoose = require('mongoose')
const md5 = require('blueimp-md5')
//const SECRET = 'Hayden'
// 得到路由器对象
const router = express.Router()

//获取所有用户列表
router.get('/api/users', (req, res) => {
    
    UserModel.find()
        .then(users => {
            RoleModel.find().then(roles => {
                res.send({status: 0, data: {users, roles}})
            })
        })
        .catch(error => {
        console.error('获取用户列表异常', error)
        res.send({status: 1, msg: '获取用户列表异常, 请重新尝试'})
      })

    
})

//注册
router.post('/api/register', async (req, res) => {
    const user = await UserModel.create({
        username: req.body.username,
        password: req.body.password
    })
    //console.log(req.body)
    res.send(user)
})

//登录
router.post('/api/login', async (req, res) => {
    //check user isavailable?
    try {
        const { username, password } = req.body
        console.log(req.body)
        console.log(req.query)
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

// 添加分类
router.post('/api/manage/category/add', (req, res) => {
    const {categoryName, parentId} = req.body
    CategoryModel.create({name: categoryName, parentId: parentId || '0'})
      .then(category => {
        res.send({status: 0, data: category})
      })
      .catch(error => {
        console.error('添加分类异常', error)
        res.send({status: 1, msg: '添加分类异常, 请重新尝试'})
      })
  })
  
  // 获取分类列表
  router.get('/api/manage/category/list', (req, res) => {
    const parentId = req.query.parentId || '0'
    CategoryModel.find({parentId})
      .then(categorys => {
        res.send({status: 0, data: categorys})
      })
      .catch(error => {
        console.error('获取分类列表异常', error)
        res.send({status: 1, msg: '获取分类列表异常, 请重新尝试'})
      })
  })
  
  // 更新分类名称
  router.post('/api/manage/category/update', (req, res) => {
    const {categoryId, categoryName} = req.body
    CategoryModel.findOneAndUpdate({_id: categoryId}, {name: categoryName})
      .then(oldCategory => {
        res.send({status: 0,data:oldCategory})
      })
      .catch(error => {
        console.error('更新分类名称异常', error)
        res.send({status: 1, msg: '更新分类名称异常, 请重新尝试'})
      })
  })

  //删除分类
  router.post('/api/manage/category/delete', (req, res) => {
    const {categoryId} = req.query
    
    CategoryModel.deleteOne({_id: categoryId})
    .then((doc) => {
      res.send({status: 0})
    })
})

// 添加产品
router.post('/api/manage/product/add', (req, res) => {
  const product = req.query
  // console.log('body', req.body)
  // console.log('query', req.query)
  ProductModel.create(product)
    .then(product => {
      res.send({status: 0, data: product})
    })
    .catch(error => {
      console.error('添加产品异常', error)
      res.send({status: 1, msg: '添加产品异常, 请重新尝试'})
    })
})

// 获取产品分页列表
router.get('/api/manage/product/list', (req, res) => {
  const {pageNum, pageSize} = req.query
  ProductModel.find({})
    .then(products => {
      res.send({status: 0, data: pageFilter(products, pageNum, pageSize)})
    })
    .catch(error => {
      console.error('获取商品列表异常', error)
      res.send({status: 1, msg: '获取商品列表异常, 请重新尝试'})
    })
})

// 搜索产品列表
router.get('api/manage/product/search', (req, res) => {
  const {pageNum, pageSize, searchName, productName, productDesc} = req.query
  let contition = {}
  if (productName) {
    contition = {name: new RegExp(`^.*${productName}.*$`)}
  } else if (productDesc) {
    contition = {desc: new RegExp(`^.*${productDesc}.*$`)}
  }
  ProductModel.find(contition)
    .then(products => {
      res.send({status: 0, data: pageFilter(products, pageNum, pageSize)})
    })
    .catch(error => {
      console.error('搜索商品列表异常', error)
      res.send({status: 1, msg: '搜索商品列表异常, 请重新尝试'})
    })
})





/*
得到指定数组的分页信息对象
 */
function pageFilter(arr, pageNum, pageSize) {
  pageNum = pageNum * 1
  pageSize = pageSize * 1
  const total = arr.length
  const pages = Math.floor((total + pageSize - 1) / pageSize)
  const start = pageSize * (pageNum - 1)
  const end = start + pageSize <= total ? start + pageSize : total
  const list = []
  for (var i = start; i < end; i++) {
    list.push(arr[i])
  }

  return {
    pageNum,
    total,
    pages,
    pageSize,
    list
  }
}

require('./file-upload')(router)


module.exports = router
const mongoose = require('mongoose')
const md5 = require('blueimp-md5')
const UserSchema = new mongoose.Schema({
    username: {type:String, unique: true, required: true},
    password: {type:String, required: true},
    phone: String,
    email: String,
    create_time: {type: Number, default: Date.now},
    role_id: String
})
const UserModel = mongoose.model('User', UserSchema)

//UserModel.db.dropCollection('users')

// 初始化默认超级管理员用户: admin/admin
UserModel.findOne({username: 'admin'}).then(user => {
    if(!user) {
      UserModel.create({username: 'admin', password: md5('admin')})
              .then(user => {
                console.log('初始化用户: 用户名: admin 密码为: admin')
              })
    }
  })

module.exports = UserModel
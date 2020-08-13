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

// initialization of default super user: admin/admin
UserModel.findOne({username: 'admin'}).then(user => {
    if(!user) {
      UserModel.create({username: 'admin', password: md5('admin')})
              .then(user => {
                console.log('User initialization -> Username: admin; Password: admin')
              })
    }
  })

module.exports = UserModel
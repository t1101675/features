/**
  * 为用户产生一个Token
  */

const jwt = require('jsonwebtoken')

module.exports = function(user_id){
    const token = jwt.sign({
        user_id: user_id
    }, 'lyricz', {
        expiresIn: '60s'
    })
    return token
}

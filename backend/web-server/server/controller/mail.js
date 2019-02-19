/**
  * 发送邮件的系统
  * 邮件服务器用的是TYX同学自己搭的服务器
  */

const nodemailer = require('nodemailer')
const mlog = require('./mlog')

/**
  * 发件箱
  */
const transporter = nodemailer.createTransport({
  host: 'smtp.exmail.qq.com',
  port: 587, /* SMTP */
  secureConnection: true, /* SSL */
  auth: {
    user: 'no-reply@taiks.space',
    pass: 'xz3-SDh-Reo-7T4'
  }
})

/**
  * 判断邮件格式是否符合规则
  */
const validateEmail = (email) => {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

/**
  * 发送邮件
  */
const sendMail = async (mail, text, option) => {
  mlog.info('mail', 'sendMail', 'Trying to mail.')
  let mailOptions = {
    from: 'no-reply@taiks.space',
    to: mail,
    subject: 'FEATURES - GAME - ' + option,
    text: text
  }
  if (!validateEmail(mail)) return false
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      /* Error while sending */
      mlog.err('mail', 'sendMail', error)
    }
  })
  return true
}

/**
  * 发送注册激活码
  */
const sendCode = (username, mail, code) => {
  return sendMail(mail,
    '请点击以下链接已完成你的注册：' +
    '\nhttps://featuresgame.tk:8001/api/activate?username=' +
    username + '&code=' + code, 'VERIFY')
}

/**
  * 发送修改密码的密码
  */
const sendChangeReq = (mail, code) => {
  return sendMail(mail, '你的验证码是：' + code + '\n请注意，你正在修改你的密码。如果这不是你的操作，请不要将此验证码泄露给任何人。', 'RESET')
}

module.exports = {
  sendCode,
  sendChangeReq
}

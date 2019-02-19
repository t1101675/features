/**
  * 一些常用的函数和设置
  */

const config = require('../config/config')
const mlog = require('../controller/mlog')

/**
  * 随机一个字符串
  */
const randString = function(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/**
 * 检验是否合法
 */
const legitTest = {
  /**
   * 用户名
   * 要求：只包含\w，长度[4,10]
   */
  username(str) {
    if (typeof str !== 'string') {
      mlog.err('utility', 'username', 'Not a string');
      return false;
    }
    if (str.length < 4 || str.length > 10) {
      mlog.info('utility', 'username', 'Bad length');
      return false;
    }
    if (str.match(/\W/)) {
      mlog.info('utility', 'username', 'Bad content');
      return false;
    }
    return true;
  },
  /**
   * 邮箱
   */
  email(str) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(str);
  },
  /**
   * 昵称
   * 要求，长度[4,10]，非ascii按2个算
   */
  nickname(str) {
    if (typeof str !== 'string') {
      mlog.err('utility', 'nickname', 'Not a string')
      return false;
    }
    let len = str.replace(/[^\x00-\xff]/g, 'aa').length;
    return len >= 4 && len <= 10;
  },
  /**
   * SLOT
   * 为0到2的数字
   */
  slot(str) {
     if (typeof str !== 'string'){
       mlog.info('utility', 'slot', 'Not a string')
       return false
     }
     return str.length === 1 && ('0' <= str && str <= '2')
  },
  /**
   * 头像上传
   */
  profile(file) {
    let mimetype = file.mimetype, size = file.size
    return size <= config.maxProfileSize && ((['image/png', 'image/jpg', 'image/jpeg', 'image/bmp']).includes(mimetype))
  },
  /**
   * 英雄上传
   */
  hero(file) {
    let mimetype = file.mimetype, size = file.size
    return size <= config.maxHeroSize && ((['image/png', 'image/jpg', 'image/jpeg', 'image/bmp']).includes(mimetype))
  }
 };

 module.exports = {
   legitTest, randString
 }

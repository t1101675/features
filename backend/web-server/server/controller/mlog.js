/**
  * 日志的系统
  * 分成错误和信息
  * 需要指定是哪个文件的哪个函数
  */

const err = function (file, func, info) {
  console.log('[ERRO] [' + file + ': ' + func + '] ' + info)
}

const info = function (file, func, info) {
  console.log('[INFO] [' + file + ': ' + func + '] ' + info)
}

module.exports = {
  err, info
}

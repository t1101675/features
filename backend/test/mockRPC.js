/**
  * 一个Remote Process Call的模拟的壳
  * 需要套在RPC的API的上面
  * 带_的函数不套壳
  */

var judge_in = function (fname) {
  return fname[0] != '_'
}

module.exports = function(cons, ...args) {
  var instance = new cons(...args)
  for (var func in instance) {
    if ((typeof instance[func]) == 'function' && judge_in(func)) {
      instance[func + '_ptb'] = instance[func]
      let rpc_call = instance[func + '_ptb']
      instance[func] = (function(is, fc) {
        return function(session, ...pars) {
          return is[fc + '_ptb'].apply(is, pars)
        }
      })(instance, func)
    }
  }
  return instance
}

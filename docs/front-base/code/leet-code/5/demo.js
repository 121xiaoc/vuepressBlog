// 函数颗粒话
// 延迟计算

function currying(fn, ...args) {
  return function(...args1) {
    if(args1.length == 0) {
      return fn.apply(null, [...args, ...args1])
    } else {
      return currying(fn, ...args, ...args1)
    }
  }
}

const add = currying((...args) => {
  return args.reduce((pre, item) => {
    return pre + item
  })
}, 1)

console.log(add(1)(2)())



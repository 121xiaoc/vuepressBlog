Function.prototype.myCall = function (context, ...args) {
  context = context || window
  const symbol = Symbol()
  context[symbol] = this
  const result = context[symbol](...args)
  delete context[symbol]
  return result
}
var name = 'gzc'
function say () {
  console.log(this.name)
}
var obj = {
  name: 'gzc1'
}

say.myCall(obj)

function say2 (msg1, msg2) {
  console.log(msg1)
  console.log(msg2)
}
say2.myCall(obj, 1, 2)


Function.prototype.myApply = function(context, args) {
  context = context || window
  const symbol = Symbol()
  context[symbol] = this
  const result = context[symbol](...args)
  delete context[symbol]
  return result
}

function say2 (msg1, msg2) {
  console.log(msg1)
  console.log(msg2)
}

say2.myApply(obj, [1, 2])

Function.prototype.bind = function(context, ...args) {
  context = context || window
  const symbol = Symbol()
  context[symbol] = this
  return function(...args1) {
    const result = context[symbol](...args, ...args1)
    delete context[symbol]
    return result
  }
}

function say3(msg1, msg2) {
  console.log(this.name)
  console.log('msg1', msg1)
  console.log('msg2', msg2)
}
say3.bind(null, 1)(2)

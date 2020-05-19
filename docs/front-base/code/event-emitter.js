// 最基础
// on emit 事件

class EventEmitter {
  constructor () {
    this.event = {}
  }
  on (type, callback) {
    if(this.event[type]) {
      this.event[type].push(callback)
    } else {
      this.event[type] = [callback]
    }
  }
  emit (type, ...args) {
    if(this.event[type]) {
      this.event[type].forEach(item => {
        item.apply(this, args)
      })
    }
  }
  off(type, callback) {
    if(this.event[type]) {
      this.event[type] = this.event[type].filter(item => {
        return item != callback
      })
    }
  }
  once(type, callback) {
    function fn (...args) {
      callback.apply(this, args)
      // 注意这里需要传入 fn
      this.off(type, fn)
    }
    this.on(type, fn)
  }
}

var eventEmitter = new EventEmitter()
function say (word) {
  console.log(word)
}
eventEmitter.on('add', say)
eventEmitter.emit('add', 'hi')

eventEmitter.off('add', say)
eventEmitter.emit('add', 'hi')

eventEmitter.once('once', say)
eventEmitter.emit('once', 'hi')
eventEmitter.emit('once', 'hi')
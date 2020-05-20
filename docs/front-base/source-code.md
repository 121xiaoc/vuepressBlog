# 源码实现

## Promise

[Promise参考来源](https://juejin.im/post/5c88e427f265da2d8d6a1c84#heading-0)

遵照Promise/A+规则自己写一个promise

#### 1. new Promise 的时候需要传入一个方法(executor),此方法立即执行

``` js
class MyPromise {
  constructor(executor) {
    executor()
  }
}
``` 
#### 2. executor 接受两个参数，分别是 resolve 和 reject
``` js
class MyPromise {
  constructor(executor) {
    function resolve() {

    }
    function reject() {

    }
    executor(resolve, reject)
  }
}
```

#### 3. promise 的状态只能由 pending 到 resolve 或者 pending 到 resolve。promise 的状态一旦确认，就不会再改变。rosolve 和 reject 接收一个传递的值并记录下来

``` js
/*
 * 控制状态
 */
const PENDING = 'pinging'
const RESOLVE = 'resolve'
const REJECT = 'reject'
class MyPromise {
  constructor(executor) {
    const self = this
    this.status = PENDING
    this.value = ''
    function resolve(value) {
      if(self.status === PENDING) {
        self.status = RESOLVE
        self.value = value
      }
    }
    function reject() {
      if(self.status = PENDING) {
        self.status = REJECT
      }
    }
    executor(resolve, reject)
  }
}
```

#### 4. 每一个 Promise 都有 then 方法, then 方法接收 2个回调函数：onResolve 和 onReject。并且这两个参数都是函数,如果不是函数，那就传入什么返回什么

``` js
class MyPromise {
  then(onResolve, onReject) {
    typeof onResolve !== 'function' 
      && (onResolve = val => val)
    typeof onReject !== 'function'
      && (onReject = val => {throw val})
  }
}
```

::: tip
我感觉接下来的5、6点是 Promise 最核心的地方
:::

#### 5. 调用 then 时, 如果状态是 resolve 就执行 onResolve 的方法。如果状态 reject 就执行 onReject 的方法
``` js
class MyPromise {
  then(onResolve, onReject) {
    typeof onResolve !== 'function' 
      && (onResolve = val => val)
    typeof onReject !== 'function'
      && (onReject = val => {throw val})
    if(this.status === RESOLVE) {
      onResolve(this.value)
    }
    if(this.status === REJECT) {
      onReject(this.value)
    }
  }
}
```
::: tip
以上只支持同步,不支持异步
:::
#### 6. 支持异步,调用 then 时, 如果状态为 pending 的时候
将 onResolve 存到 实例的 onResolveList 中和 将 onReject 存到实例的 onRejectList 方法中

``` js
const PENDING = 'pinging'
const RESOLVE = 'resolve'
const REJECT = 'reject'
class MyPromise {
  constructor(executor) {
    console.log('create')
    const self = this
    this.status = PENDING
    this.onResolveList = []
    this.onRejectList = []
    this.value = ''
    function resolve(value) {
      if(self.status === PENDING) {
        self.status = RESOLVE
        self.value = value
        self.onResolveList.forEach(item => {
          console.log(item)
          item(self.value)
        })
      }
    }
    function reject(value) {
      if(self.status = PENDING) {
        self.status = REJECT
        self.value = value
        self.onRejectList.forEach(item => {
          console.log(item)
          item(self.value)
        })
      }
    }
    executor(resolve, reject)
  }

  then(onResolve, onReject) {
    typeof onResolve !== 'function' 
      && (onResolve = val => val)
    typeof onReject !== 'function'
      && (onReject = val => val)
    if(this.status === RESOLVE) {
      onResolve(this.value)
    }
    if(this.status === REJECT) {
      onReject(this.value)
    }
    if(this.status === PENDING) {
      this.onResolveList.push(onResolve)
      this.onRejectList.push(onReject)
    }
  }
}

```

#### 7. promise可以then多次,then会返回一个promise

``` js
class MyPromise {
  then(onResolve, onReject) {
    typeof onResolve !== 'function' 
      && (onResolve = val => val)
    typeof onReject !== 'function'
      && (onReject = val => val)
    if(this.status === RESOLVE) {
      return new MyPromise((resolve) => {
        onResolve(this.value)
        resolve()
      })
    }
    if(this.status === REJECT) {
      return new MyPromise((resolve, reject) => {
        onReject(this.value)
        resolve()
      })
    }
    if(this.status === PENDING) {
      return new MyPromise((resolve, reject) => {
        this.onResolveList.push(() => {
          onResolve(this.value)
          resolve()
        })
        this.onRejectList.push(() => {
          onReject(this.value)
          resolve()
        })
      }) 
    }
  }
}
```

#### 8. 如果then返回的是一个值,就吧这个结果传递给下一个then,成功就传下一个then的resolve(),失败就传下一个then的reject()

``` js
class MyPromise {
  then(onResolve, onReject) {
    typeof onResolve !== 'function' 
      && (onResolve = val => val)
    typeof onReject !== 'function'
      && (onReject = val => val)
    if(this.status === RESOLVE) {
      return new MyPromise((resolve) => {
        const x = onResolve(this.value)
        resolve(x)
      })
    }
    if(this.status === REJECT) {
      return new MyPromise((resolve, reject) => {
        const x = onReject(this.value)
        resolve(x)
      })
    }
    if(this.status === PENDING) {
      return new MyPromise((resolve, reject) => {
        this.onResolveList.push(() => {
          const x = onResolve(this.value)
          resolve(x)
        })
        this.onRejectList.push(() => {
          const x = onReject(this.value)
          resolve(x)
        })
      }) 
    }
  }
}
```

#### 9.如果上一个then返回的是promise,需要等待这个promise执行完,如果成功执行下一个then的reslve().失败执行下一个then的reject()

``` js
class MyPromise {
  then(onResolve, onReject) {
    typeof onResolve !== 'function' 
      && (onResolve = val => val)
    typeof onReject !== 'function'
      && (onReject = val => val)
    if(this.status === RESOLVE) {
      return new MyPromise((resolve) => {
        const x = onResolve(this.value)
        resolve(x)
      })
    }
    if(this.status === REJECT) {
      return new MyPromise((resolve, reject) => {
        const x = onReject(this.value)
        resolve(x)
      })
    }
    if(this.status === PENDING) {
      return new MyPromise((resolve, reject) => {
        this.onResolveList.push(() => {
          const x = onResolve(this.value)
          resolvePromise(x, resolve, reject)
        })
        this.onRejectList.push(() => {
          const x = onReject(this.value)
          resolvePromise(x, resolve, reject)
        })
      }) 
    }
  }
}

function resolvePromise(x, resolve, reject) {
  if(x && typeof x === 'object') {
    const then = x.then
    if(typeof then === 'function') {
      then.call(x, res => {
        resolvePromise(res, resolve, reject)
      }, res => {
        reject()
      })
    } else {
      resolve(x)
    }
  } else {
    resolve(x)
  }
}
```

## 防抖、节流

#### 防抖是N秒内只会执行一次，如果N秒内再次触发，则重新计算时间

``` js
function debounce (fn, delay) {
  let timer = null
  return function () {
    timer && clearTimeout(timer)
    const args = arguments
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
```

#### 节流是N秒内就会执行一次，如果N秒内再次触发、不会重新计算

``` js
function throttle (fn, delay) {
  let startTime = +new Date()
  return function () {
    const endTime = +new Date()
    if(endTime - startTime > delay) {
      fn.apply(this, arguments)
    }
  }
}
```

::: tip
将防抖和节流合一起
:::

``` js
function throttle(fn, delay) {
  const timer = null
  let startTime = 0
  return function () {
    const endTime = +new Date()
    const args = arguments
    timer && clearTimeout(timer)
    if(startTime && endTime - startTime < delay) {
      timer = setTimeout(() => {
        fn.apply(this, args)
        startTime = +new Date()
      }, delay)
    } else {
      fn.apply(this, args)
      startTime = +new Date()
    }
  }
}
```

## EventEmitter(发布订阅模式)

最重要的两个功能on和emit

```js
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
}
```
和移除的off事件

``` js
class EventEmitter {
  off(type, callback) {
    if(this.event[type]) {
      this.event[type] = this.event[type].filter(item => {
        return item != callback
      })
    }
  }
}
```

和once事件
``` js
class EventEmitter {
  once(type, callback) {
    function fn (...args) {
      callback.apply(this, args)
      this.off(type, fn)
    }
    this.on(type, fn)
  }
}
```
::: warning
  once事件中,需要注意的是this.off中传入的是fn不是callback
:::

## call, apply, bind

#### call
1. context如果没有就是window
2. 为context设置一个值fn,指向的就是this
3. 然后传入参数
4. 删除context上的fn
```js
Function.prototype.myCall = function(context, ...args) {
  context = context || window
  const symbol = Symbol()
  context[symbol] = this
  const result = context[symbol](...args)
  delete context[symbol]
  return result
}

```

#### apply
apply基本上与call相同, 只是传入的参数只取第一个
``` js
Function.prototype.myApply = function(context, args) {
  context = context || window
  const symbol = Symbol()
  context[symbol] = this
  const result = context[symbol](...args)
  delete context[symbol]
  return result
}
```

#### bind
bind返回一个方法
```js
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
```

#### new 

```js
myNew(fn, ...args) {
  const obj = {}
  obj._prop_ = fn.prototype
  const result = fn.apply(obj, args)
  if((result && typeof result === 'object') || typeof result === 'function') {
    return result
  }
  return obj
}
```














/**
 * 1.new Promise 的时候需要传入一个方法(executor),此方法立即执行
 * 2.executor接收两个参数,分别为resolve和reject
 * 3.
 */
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
      return new MyPromise((resolve) => {
        const x = onResolve(this.value)
        resolve(x)
      })
    }
    if(this.status === REJECT) {
      return new MyPromise((resolve, reject) => {
        const x = onReject(this.value)
        reject(x)
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
          reject(x)
        })
      }) 
    }
  }
}


class MyPromise {
  then(onResolve, onReject) {
    typeof onResolve !== 'function' 
      && (onResolve = val => val)
    typeof onReject !== 'function'
      && (onReject = val =>  val)
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

var promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  },1000)
})
promise.then((val) => {
  console.log(val)
})
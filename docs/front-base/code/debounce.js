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


document.addEventListener('scroll', throttle((res) => {
  console.log(res)
}, 5000))
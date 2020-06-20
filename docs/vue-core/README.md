# Vue 源码阅读
(参考)[https://ustbhuangyi.github.io/vue-analysis/v2/data-driven/]
## 开始
入口文件src/core/instance/index.js

``` js
function Vue (options) {
  // 1
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 2
  this._init(options)
}
```
1. 必须为Vue实例
2. 调用_init方法

_init方法:src/core/instance/init.js

``` js
Vue.prototype._init = function (options) {
  const vm = this
  // 1
  vm._uid = uid++
  // 2
  vm._isVue = true
  // 3
  vm.$options = options
  // 4
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm) // resolve injections before data/props
  initState(vm)
  initProvide(vm) // resolve provide after data/props
  callHook(vm, 'created')
  // 5
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}
```
1. 每个实例都有自己的id
2. 实例有一个_isVue的参数为true
3. 设置实例的$options
4. 始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 
5. 用vm.$mount对dom进行挂载

vm.$mount写在src/platform/web/entry-runtime-with-compiler.js
``` js
// 1 
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function(el) {
  el = el && query(el)
  // 2
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }
  const options = this.$options
  // 3
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
           template = idToTemplate(template)
           if(process.env.NODE_ENV !== 'production' && !template){
              warn('Template element not found or is empty:')
           }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template)
        }
        return this
      }
    }
    // 4 
    else if (el) {
      template = getOuterHTML(el)
    }
    // 5
    if(template) {
      const { render, staticRenderFns } = compileToFunctions(template)
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }
  // 6
  return mount.call(this, el, hydrating)
}
```
1. 记录初始Vue的$mount
2. el不能为body和html标签
3. 如果options.render没有的话,就拿template
4. 如果template不存在,就拿el
5. 将template转化为render
6. 

总结: 设置VUE实例的option的render











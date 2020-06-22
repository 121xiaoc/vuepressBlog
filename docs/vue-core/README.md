# Vue 源码阅读
(参考)[https://ustbhuangyi.github.io/vue-analysis/v2/data-driven/]
## 开始

## new Vue 发生了什么
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

总结：初始化必要的东西,和调用了beforeCreate, created

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
1. 记录Vue原型的$mount
2. el不能为body和html标签
3. 如果options.render没有的话,就拿template
4. 如果template不存在,就拿el
5. 将template转化为render
6. 最后将调用VUE初始的mount

总结: 关键是定义实例option的render方法

Vue初始原型文件地址 src/platform/web/runtime/index.js

``` js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  // 1
  return mountComponent(this, el)
}
```
1. 实际上会去调用 mountComponent

mountComponent方法在 src/core/instance/lifecycle.js

``` js
function mountComponent(vm, el) {
  // 1
  callHook(vm, 'beforeMount')
  // 3
  updateComponent = () => {
    const vnode = vm._render()
    vm._update(vnode)
  }
  // 2
  new Watcher(vm, updateComponent, {
    before () {
      callHook(vm, 'beforeUpdate')
    }
  })
  // 4
  callHook(vm, 'mounted')
}
```
1. 调用beforeMount生命周期
2. 核心: 生成Watch实例,初始化会调用updateComponent方法, 更新页会调用
3. updateComponent方法，调用Vue实例的_render渲染方法生成vnode,在调用update
4. 调用mounted生命周期

总结: 抛开Watch,_render()和_update无疑是最重要的


_render方法是实例的一个私有方法,他用来将实例转化为一个虚拟Node src/core/instance/render.js

``` js
Vue.prototype._render = function () {
  const { render, _parentVnode } = vm.$options
  // 1
  let vnode = render.call(vm._renderProxy, vm.$createElement)
  vnode.parent = _parentVnode
  return vnode
}
```

1. 核心是调用了option.render返回了虚拟的vnode,而主要调用createElement来生成

::: tip
Virtual DOM
真正的 DOM 元素是非常庞大的,当我们频繁的去做 DOM 更新，会产生一定的性能问题。由于 Virtual DOM 只是用来映射到真实 DOM 的渲染，不需要包含操作 DOM 的方法，因此它是非常轻量和简单的
:::

_update方法是，是实例的一个私有方法，它被调用的时候有两个，首次渲染和数据更新的时候 定义在src/core/instance/lifecycle.js

``` js
Vue.prototype._update = function (vnode: VNode) {
  const prevVnode = vm._vnode
  // 1
  vm.$el = vm.__patch__(prevVnode, vnode)
}
```

1. 核心,调用vm的__patch__方法,第一个参数为初始的虚拟dom,第二个参数为目前的虚拟dom


patch方法定义在 src/platforms/web/runtime/patch.js

``` js
import { createPatchFunction } from 'core/vdom/patch'
export const patch: Function = createPatchFunction({ nodeOps, modules })
```

createPatchFunction 定义在 src/core/vdom/patch

``` js
function createPatchFunction (backend) {
  return function patch (oldVnode, vnode) {
    // 1
    oldVnode = emptyNodeAt(oldVnode)
    const parentElm = nodeOps.parentNode(oldElm)
    // 2
    createElm(
      vnode,
      insertedVnodeQueue,
      oldElm._leaveCb ? null : parentElm,
      nodeOps.nextSibling(oldElm)
    )
  } 
}
```
1. 通过 emptyNodeAt 方法把 oldVnode 转换成 VNode 对象
2. 然后再调用 createElm 方法

createElm 方法的作用是通过虚拟节点创建真实的 DOM 并插入到它的父节点中

``` js
function createElm (
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
) {
  // 1
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }
  const data = vnode.data
  const children = vnode.children
  const tag = vnode.tag
  if (isDef(tag)) {
    // 2
    vnode.elm = vnode.ns
      ? nodeOps.createElementNS(vnode.ns, tag)
      : nodeOps.createElement(tag, vnode)
    // 3
    createChildren(vnode, children, insertedVnodeQueue)
    if (isDef(data)) {
      invokeCreateHooks(vnode, insertedVnodeQueue)
    }
    // 4
    insert(parentElm, vnode.elm, refElm)
  }
}
```

1. 尝试这创建一个组件, 如果创建成功 则 返回
2. Vue的ele上赋值当前元素, 为之后子元素插入的父元素
3. 递归创建子元素
4. 插入到父元素中

createChildren 方法
``` js
function createChildren (vnode, children, insertedVnodeQueue) {
  if (Array.isArray(children)) {
    // 1
    for (let i = 0; i < children.length; ++i) {
      createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
    }
  } // 2 
  else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
  }
}
```
1. 递归创建子节点的元素
2. 如果 vnode.text 存在, 插入到父元素中

insert 方法
``` js
function insert (parent, elm, ref) {
  if (isDef(parent)) {
    if (isDef(ref)) {
      if (ref.parentNode === parent) {
        nodeOps.insertBefore(parent, elm, ref)
      }
    } else {
      nodeOps.appendChild(parent, elm)
    }
  }
}
```

## 组件化
在上一章说的实例的 _render 函数实际上调用的是 createElement 函数,它定义在 src/core/vdom/create-elemenet.js

``` js
function _createElement() {
  context,
  tag,
  data,
  children,
  normalizationType
} {
  if (typeof tag === 'string') {
    // 1
    if (config.isReservedTag(tag)) {
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
      // 2 
      else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag)) {
        vnode = createComponent(Ctor, data, context, children, tag)
      }
      // 3
      else {
        vnode = new VNode(
          tag, data, children,
          undefined, undefined, context
        )
      }
    }
  }
  //4 
  else {
    vnode = createComponent(tag, data, context, children)
  }
}
```
1. tag名称是在html标签里的就创建一个VNode
2. 如果是一个是已注册的组件,则通过 createComponent 创建一个组件类型的 VNode,否则创建一个未知的标签的 VNode




















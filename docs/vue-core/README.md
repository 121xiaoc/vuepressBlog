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

### createComponent
createComponent 它定义在 src/core/vdom/create-component.js
createComponent 的逻辑也有一些复杂,针对组件渲染这个 case 主要就 3 个关键步骤

1. 构造子类构造函数
``` js
// baseCtor 实际上就是Vue
const baseCtor = context.$options._base
if (isObject(Ctor)) {
  Ctor = baseCtor.extend(Ctor)
}
```
在 src/core/global-api/index.js 
``` js
Vue.options._base = Vue
```
Vue 又在init的时候执行了 
``` js
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```
因此context.$options._base可以拿到Vue

Vue.extend的定义在 src/core/global-api/extend.js

``` js
Vue.extend = function (extendOptions) {
  const Super = this
  // 拿到一个用户缓存的字段
  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
  // 有缓存就直接读缓存
  if (cachedCtors[SuperId]) {
    return cachedCtors[SuperId]
  }
  const Sub = function VueComponent (options) {
    // 调用了Vue的init
    this._init(options)
  }
  // Sub 的原型 指向了 Super 的原型
  Sub.prototype = Object.create(Super.prototype)
  Sub.prototype.constructor = Sub

  // 初始化props
  if (Sub.options.props) {
    initProps(Sub)
  }
  // 初始化computed
  if (Sub.options.computed) {
    initComputed(Sub)
  }
  // 缓存了Sub并返回了Sub
  cachedCtors[SuperId] = Sub
  return Sub
}
```

2. 安装组件钩子函数
``` js
installComponentHooks(data)
```

``` js
/**
 * 子组件的生命周期和父组件的生命周期合一起
 */
function installComponentHooks (data) {
  const hooks = data.hook
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[key]
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}

```
整个 installComponentHooks 的过程就是把 componentVNodeHooks 的钩子函数合并到 data.hook 中

componentVNodeHooks 的钩子函数

``` js
const componentVNodeHooks = {
  init() {
    // ...
  }
  prepatch() {
    // ...
  }
  insert() {
    // ...
  }
  destroy() {
    // ...
  }
}
```
3. 实例化VNode

``` js
const name = Ctor.options.name || tag
const vnode = new VNode(`vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
  data, undefined, undefined, undefined, context,
  { Ctor, propsData, listeners, tag, children },
  asyncFactory)
return vnode
```
通过 new VNode 实例化一个 vnode 并返回

createComponent 后返回的是组件 vnode，它也一样走到 vm._update 方法，进而执行了 patch 函数


### patch
patch 的过程会调用 createElm 创建元素节点,在上一节中已经知道它定义在 src/core/vdom/patch.js

``` js
function createElm (
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  // ...
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }
  // ...
}
```
组件调用 createComponent 生成Element
createComponent 函数中，首先对 vnode.data 做了一些判断：
``` js
function createComponent(vnode) {
  let i = vnode.data
  // ...
  if (isDef(i = i.hook) && isDef(i = i.init)) {
    i(vnode)
  }
  // ...
  
}
```
其中的init钩子函数非常重要, 上一小节 创建组件 VNode 的时候合并钩子函数中就包含 init 钩子函数,它定义在 src/core/vdom/create-component.js

``` js
init(vnode) {
  const child = vnode.componentInstance = createComponentInstanceForVnode(
    vnode,
    activeInstance
  )
  child.$mount(undefined, false)
}
```
它是通过 createComponentInstanceForVnode 创建一个 Vue 的实例, 然后调用 $mount 方法挂载子组件

``` js
function createComponentInstanceForVnode () {
  const options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  return new vnode.componentOptions.Ctor(options)
} 
```
这里的 vnode.componentOptions.Ctor 对应的就是子组件的构造函数.几个关键参数要注意几个点，_isComponent 为 true 表示它是一个组件，parent 表示当前激活的组件实例

所以子组件的实例化实际上就是在这个时机执行的.所以会执行实例的 _init 方法.

``` JS
const Sub = function VueComponent (options) {
  // 调用了Vue的init
  this._init(options)
}
```
而这里又回到了一开始的Vue.prototype._init

```js
Vue.prototype._init = function (options) {
  const vm = this
  // ...
  if (options && options._isComponent) {
    initInternalComponent(vm, options)
  }
  // ...
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  } 
}
```
initInternalComponent 方法就是将createComponentInstanceForVnode 定义的option放到组件实例的$options上

因为组件是没有vm.$options.el的所以无法执行下面的vm.$mount(vm.$options.el),组件的mount自己接管了在他的init钩子函数中

``` js
function init(vnode) {
  // ...
  child.$mount(undefined, false)
}
```
它最终会调用 mountComponent 方法，进而执行 vm._render() 方法

``` js
Vue.prototype._render = function () {
  const vm = this
  const { render, _parentVnode } = vm.$options
  vm.$vnode = _parentVnode
  vnode = render.call(vm._renderProxy, vm.$createElement)
  vnode.parent = _parentVnode
  return vnode
}
```
这里的 _parentVnode 就是当前组件的父 VNode,而 render 函数生成的 vnode 当前组件的渲染 vnode，vnode 的 parent 指向了 _parentVnode，也就是 vm.$vnode

_render之后就要_update了, vm._update 的定义在 src/core/instance/lifecycle.js
``` js
export let activeInstance = null
Vue.prototype._update = function (vnode, hydrating) {
  const vm = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  const prevActiveInstance = activeInstance
  activeInstance = vm
  vm._vnode = vnode
  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  activeInstance = prevActiveInstance
}

```
_update 过程中有几个关键的代码
1. 首先 vm._vnode = vnode 的逻辑.vm._vnode 和 vm.$vnode 的关系就是一种父子关系, 用代码表达就是 vm._vnode.parent === vm.$vnode

2. activeInstance 作用就是保持当前上下文的 Vue 实例.它是在 lifecycle 模块定义的全局变量.在mount之前会调用 initLifecycle(vm) 方法

``` js
export function initLifecycle(vm) {
  const options = vm.$options
  let parent = options.parent
  // ...
  parent.$children.push(vm)
  // ...
  vm.$parent = parent
}
```
vm.$parent 就是用来保留当前 vm 的父实例,并且通过 parent.$children.push(vm) 来把当前的 vm 存储到父实例的 $children 中

在vm._update中,把当前的vm 赋值给 activeInstanc,同时通过 const prevActiveInstance = activeInstance 用 prevActiveInstance 保留上一次的 activeInstance,当一个 vm 实例完成它的所有子树的 patch 或者 update 过程后，activeInstance 会回到它的父实例，这样就完美地保证了 createComponentInstanceForVnode 整个深度遍历过程中，我们在实例化子组件的时候能传入当前子组件的父 Vue 实例，并在 _init 的过程中，通过 vm.$parent 把这个父子关系保留


最后就是调用__patch__ 渲染 VNode 

``` js
function patch (oldVnode, vnode) {
  // ...
  createElm(vnode, insertedVnodeQueue)
  // ...
}
```
又是调用 CreateElm()

``` js
function createElm (
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  // ...
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }
  // ...
}
```
如果组件的根节点是个普通元素，那么 vm._vnode 也是普通的 vnode，这里 createComponent(vnode, insertedVnodeQueue, parentElm, refElm) 的返回值是 false。接下来的过程就和我们上一章一样了

由于我们这个时候传入的 parentElm 是空，所以对组件的插入，在 createComponent 有这么一段逻辑：

``` js
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  if (isDef(vnode.componentInstance)) {
    initComponent(vnode, insertedVnodeQueue)
    insert(parentElm, vnode.elm, refElm)
    if (isTrue(isReactivated)) {
      reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
    }
    return true
  }
}
```
最后执行 insert(parentElm, vnode.elm, refElm) 完成组件的 DOM 插入，如果组件 patch 过程中又创建了子组件，那么DOM 的插入顺序是先子后父

### 合并配置

调用 Vue.portotype._init 无非就是2种场景 1. 主动调用 new Vue() 2. 组件实例化 在 patch 的时候

``` js
Vue.prototype._init = function(option) {
  // 是组件
  if (options._isComponent) {
    initInternalComponent(vm, options)
  } else {
    vm.$options = mergeOptions(
      vm.options,
      options,
      vm
    )
  }
} 
```

首先介绍 mergeOptions(vm.options, options || {}, vm)

其中 vm.options 中在初始化定义了
``` js
Vue.options.components = {}
Vue.options.directives = {}
Vue.options.filters = {}
```

``` js
mergeOptions(parent,child,vm) {
  // ...
  if(child.extends) {
    mergeOptions(parent, child.extends, vm)
  }
  // ...
  if(child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  //...
}
```

extend 和 mixins 可以被合并 options






















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

extend 和 mixins 可以被合并 options 里

2. 组件场景

组件的构造函数是通过 Vue.extend 它定义在src/core/global-api/extend.js

``` js
Vue.extend = function (extendOptions) {
  // ...
  Sub.options = mergeOptions(
    Super.options,
    extendOptions
  )
  // ...
  return Sub
}
```

这里的 extendOptions 对应的就是前面定义的组件对象，它会和 Vue.options 合并到 Sub.opitons 中

组件的初始化过程，代码定义在 src/core/vdom/create-component.js

``` js
function createComponentInstanceForVnode() {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  // ... 
  return new vnode.componentOptions.Ctor(options)
}
```
这个 new vnode.componentOptions.Ctor(options) 之后就会走的 Vue.prototype._init() 里
之后会调用 init 里的 initInternalComponent 方法

``` js
export function initInternalComponent () {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // ...
}
```

纵观一些库、框架的设计几乎都是类似的，自身定义了一些默认配置，同时又可以在初始化阶段传入一些定义配置，然后去 merge 默认配置

vm.$options 差不多是这样
``` js
vm.$options = {
  parent: Vue /*父Vue实例*/,
  propsData: undefined,
  _componentTag: undefined,
  _parentVnode: VNode /*父VNode实例*/,
  _renderChildren:undefined,
  __proto__: {
    components: { },
    directives: { },
    filters: { },
    _base: function Vue(options) {
        //...
    },
    _Ctor: {},
    created: [
      function created() {
        console.log('parent created')
      }, function created() {
        console.log('child created')
      }
    ],
    mounted: [
      function mounted() {
        console.log('child mounted')
      }
    ],
    data() {
       return {
         msg: 'Hello Vue'
       }
    },
    template: '<div>{{msg}}</div>'
  }
}
```

### 生命周期
最终执行生命周期的函数都是调用 callHook 方法。它的定义在 src/core/instance/lifecycle

``` js
function callHook(vm, hook) {
  const handlers = vm.$options[hook]
  for (let i = 0, j = handlers.length; i < j; i++) {
    handlers[i].call(vm)
  }
}
```
根据传入的字符串 hook，去拿到 vm.$options[hook] 对应的回调函数数组，然后遍历执行，执行的时候把 vm 作为函数执行的上下文

### 组件注册
全局注册
例如
``` js
Vue.component('my-component', { })
```

那么，Vue.component 函数是在什么时候定义的呢，它的定义过程发生在最开始初始化 Vue 的全局函数的时候，代码在 src/core/global-api/assets.js 中
``` js
import { ASSET_TYPES } from 'shared/constants'
function initAssetRegisters(Vue) {
  ASSET_TYPES.forEach(type => {
    Vue[type] = function(id, definition) {
      //...
      if (type === 'component' && isPlainObject(definition)) {
        definition.name = definition.name || id
        definition = this.options._base.extend(definition)
      }
      // ...
      this.options[type + 's'][id] = definition
      return definition
    } 
  })
}
```
通过 this.opitons._base.extend， 相当于 Vue.extend 把这个对象转换成一个继承于 Vue 的构造函数，最后通过 this.options[type + 's'][id] = definition 把它挂载到 Vue.options.components 上

然后在创建 vnode 的过程中，会执行 _createElement 方法，它定义在 src/core/vdom/create-element.js
``` js
function _createElement(context, tag, data, children) {
  // ...
  if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    vnode = createComponent(Ctor, data, context, children, tag)
  }
  // ...
  return vnode
}
```
通过 resolveAsset 判断tag是否是一个组件，定义在 src/core/utils/options.js

``` js
function resolveAsset(
  options,
  type,
  id) {
  // options.components
  const assets = options[type]
  if (hasOwn(assets, id)) return assets[id]
  // 转化成驼峰
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  // 转化成首字符大写
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  return res
}
```
vm.$options.components[tag]，这样我们就可以在 resolveAsset 的时候拿到这个组件的构造函数，并作为 createComponent 的钩子的参数。


局部注册
在组件的 Vue 的实例化阶段有一个合并 option 的逻辑，之前我们也分析过，所以就把 components 合并到 vm.$options.components 上，这样我们就可以在 resolveAsset 的时候拿到这个组件的构造函数，并作为 createComponent 的钩子的参数


## 深入响应式原理

在 Vue 的初始化阶段，_init 方法执行的时候，会执行 initState(vm) 它的定义在 src/core/instance/state.js

``` js
function initState(vm) {
  opts = vm.$options
  initProps(vm, opts.props)
  initMethods(vm, opts.methods)
  initData(vm)
  initComputed(vm, opts.computed)
  initWatch(vm, opts.watch)
}
```
initState 方法主要是对 props、methods、data、computed 和 wathcer 等属性做了初始化

这里我们重点分析 props 和 data

``` js
function initProps (vm, propsOptions) {
  for (const key in propsOptions) {
    defineReactive(props, key, value)
  }
  if (!(key in vm)) {
    proxy(vm, `_props`, key)
  }
} 
```

一是调用 defineReactive 方法把每个 prop 对应的值变成响应式 另一个是通过 proxy 把 vm._props.xxx 的访问代理到 vm.xxx 上

``` js
function initData (vm, data) {
  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    const key = keys[i]
    proxy(vm, `_data`, key)
  }
  observe(data, true /* asRootData */)
}
```
一个是对定义 data 函数返回对象的遍历，通过 proxy 把每一个值 vm._data.xxx 都代理到 vm.xxx 上.另一个是调用 observe 方法观测整个 data 的变化，把 data 也变成响应式

proxy 代理

``` js
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}
function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```
通过 Object.defineProperty 把 target[sourceKey][key] 的读写变成了对 target[key] 的读写

observe
observe 的功能就是用来监测数据的变化，它的定义在 src/core/observer/index.js 中：
``` js
function observe (value) {
  let ob = new Observer(value)
  return ob
}
```
observe 方法的作用就是给添加一个 Observer
``` js
class Observer {
  value: any;
  dep: Dep;
  vmCount: number
  constructor (value: any) {
    this.dep = new Dep()
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

Observer 的构造函数逻辑很简单，首先实例化 Dep 对象，这块稍后会介绍，接着通过执行 def 函数把自身实例添加到数据对象 value 的 __ob__ 属性上

walk 方法是遍历对象的 key 调用 defineReactive

defineReactive 的功能就是定义一个响应式对象，给对象动态添加 getter 和 setter，它的定义在 src/core/observer/index.js

```js
function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj, key)
  const getter = property && property.get
  const setter = property && property.set
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      if (setter) {
        val = setter.call(obj, newVal)
      } else {
        val = newVal
      }
      dep.notify()
    }
  })
}
```

defineReactive 函数最开始初始化 Dep 对象的实例，接着拿到 obj 的属性描述符，然后对子对象递归调用 observe 方法，这样就保证了无论 obj 的结构多复杂，它的所有子属性也能变成响应式的对象

Object.defineProperty 去给 obj 的属性 key 添加 getter 和 setter

### 依赖收集
Dep 是整个 getter 依赖收集的核心 它的定义在 src/core/observer/dep.js 中
``` js
import type Watcher from './watcher'
let uid = 0
class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;
  constructor () {
    this.id = uid++
    this.subs = []
  }
  // 向 Dep 里添加 Watch
  addSub (sub) {
    this.subs.push(sub)
  }
  // 向 Watch 里添加 Dep
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  // 通知Watch 执行 update
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
Dep.target = null
const targetStack = []

// 将 如果 Dep.target 存在就记录到栈里
function pushTarget (_target: ?Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

function popTarget () {
  Dep.target = targetStack.pop()
}
```
需要特别注意的是它有一个静态属性 target 这是一个全局唯一 Watcher，这是一个非常巧妙的设计，因为在同一时间只能有一个全局的 Watcher 被计算

Watcher

``` js
let uid = 0
class Watcher {
  // 放deps
  deps: []
  depIds: new Set()
  newDeps: [],
  newDepIds: new Set()
  constructor(vm, expOrFn) {
    this.vm = vm
    this.getter = expOrFn
    this.value = this.get()
  }
  get () {
    pushTarget(this)
    const vm = this.vm
    // 这里去执行了 render 和 update 方法
    let value = this.getter.call(vm, vm)
    popTarget()
    this.cleanupDeps()
    return value
  }
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }
}
```
this.deps 和 this.newDeps 表示 Watcher 实例持有的 Dep 实例的数组；而 this.depIds 和 this.newDepIds 分别代表 this.deps 和 this.newDeps 的 id Set

分析过程

之前我们介绍当对数据对象的访问会触发他们的 getter 方法, 那么这些对象什么时候被访问呢？还记得之前我们介绍过 Vue 的 mount 过程是通过 mountComponent 函数
``` js
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
```
new Watcher 触发 Watch 中的构造函数 然后执行它的this.get 方法，执行
``` js
pushTarget(this)
``` 
``` js
function pushTarget (_target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}
```
实际上就是把 Dep.target 赋值为当前的 Watcher 并压栈 接着又执行了 
``` js
value = this.getter.call(vm, vm)
```
实际上就是在执行
``` js
vm._update(vm._render(), hydrating)
```
render 方法会生成渲染 VNode 并且在这个过程中会对 vm 上的数据的访问 触发数据对象的 getter

那么每个对象值的 getter 都持有一个 dep，在触发 getter 的时候会调用 dep.depend() 方法，也就会执行 Dep.target.addDep(this)

Dep.target 已经被赋值为渲染 watcher，那么就执行到 addDep 方法

``` js
addDep (dep) {
  const id = dep.id
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    if(!this.depIds.has(id)) {
      dep.addSub(this)
    }
  }
}
```
这时候会做一些逻辑判断（保证同一数据不会被添加多次）后执行 dep.addSub(this)，那么就会执行 this.subs.push(sub)，也就是说把当前的 watcher 订阅到这个数据持有的 dep 的 subs 中，这个目的是为后续数据变化时候能通知到哪些 subs 做准备。

接下来执行
``` js
popTarget()
```
``` js
Dep.target = targetStack.pop()
```
实际上就是把 Dep.target 恢复成上一个状态，因为当前 vm 的数据依赖收集已经完成，那么对应的渲染Dep.target 也需要改变

最后执行依赖清空
``` js
this.cleanupDeps()
```
``` js
cleanupDeps () {
  // 获取 上一次 Watcher 收集到的Dep的长度 
  let i = this.deps.length
  while(i--) { // 到 0 退出
    const dep = this.deps[i]
    if (!this.newDepIds.has(dep.id)) {
      // 将旧的 Dep 删除 Watcher
      dep.removeSub(this)
    }
  }
  // 将 depIds 和 newDepIds 交换并清空 newDepIds
  let tmp = this.depIds
  this.depIds = this.newDepIds
  this.newDepIds = tmp
  this.newDepIds.clear()

   tmp = this.deps
  this.deps = this.newDeps
  this.newDeps = tmp
  this.newDeps.length = 0
}
```
总结 其实 Watcher 和 Dep 就是一个非常经典的观察者设计模式的实现

### 派发更新
defineReactive 的 setter 部分
``` js
function defineReactive () {
  Object.defineProperty(obj, key, {
    set: function reactiveSetter(newValue) {
      dep.notify()
    }
  })
}
```
dep.notify() 通知所有的订阅者
``` js
class Dep {
  notify () {
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```
遍历 subs 调用每一个 watcher 的 update 方法
``` js
class Watcher {
  update () {
    queueWatcher(this)
  }
}
```
会走到一个 queueWatcher(this) 的逻辑

``` js
const queue = []
let has = {}
let waiting = false
let flushing = false
function queueWatcher(watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    queue.push(watcher)
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}
```
首先用 has 对象保证同一个 Watcher 只添加一次

接下来我们来看 flushSchedulerQueue 的实现
``` js
function flushSchedulerQueue() {
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
  }
  resetSchedulerState()
}
```
其中 resetSchedulerState 函数
``` js
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  waiting = flushing = false
}
```
恢复状态
``` js
class Watcher {
  run () {
    const value = this.get()
  }
}
```

### 计算属性
在 initStats 有一个 initComputed
``` js
function initComputed(vm, computed)
  const watchers = Object.create(null)
  for (const key in computed) {
    watchers[key] = new Watcher(vm)
  }
  defineComputed(vm, key, userDef)
```

computer 的 Watcher 构造函数和渲染 Watcher 不同
``` js
constructor() {
  if (this.computed) {
    this.value = undefined
    this.dep = new Dep()
  } else {
    // 这是渲染Watcher的逻辑
    this.get()
  }
}
``` 
computer 的 watcher 本身持有了一个 Dep

defineComputed 函数里有劫持 computer 的逻辑
``` js
function defineComputed (target, key, userDef) {
  sharedPropertyDefinition.get = createComputedGetter(key)
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```
sharedPropertyDefinition.get 是 通过 createComputedGetter 返回的
``` js
function createComputedGetter(key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    watcher.depend()
    return watcher.evaluate()
  }
}
```
也就是说当 computer 被访问的时候就会执行 sharedPropertyDefinition.get 去运行 watcher 的depend() 和 watcher的evaluate()

``` js
class Watcher {
  depend () {
    if (this.dep && Dep.target) {
      this.dep.depend()
    }
  }
  evaluate () {
    if (this.dirty) {
      this.value = this.get()
      this.dirty = false
    }
    return this.value
  }
}
```
this.get() 就会去执行 value = this.getter.call(vm, vm) 实际上就是去执行了 computer 的函数

其中 computer 函数中会有一些响应的值，那么会触发它们的 get , 因为运行了 Watcher 的 get 此时这些响应的值的 Dep.target 就是 computer 的 Watcher

一旦计算属性的所依赖的值发生变化就是触发它 setter ，通知所有订阅它变化的 watcher 更新，执行 watcher.update() 方法
watcher 的 update 方法
``` js
function update() {
  if (this.computed) {
    this.getAndInvoke(() => {
      this.dep.notify()
    })
  } else {
    queueWatcher(this)
  }
}
```
getAndInvoke
``` js
getAndInvoke (cb: Function) {
  const value = this.get()
  if (value !== this.value) {
    cb.call(this.vm, value, oldValue)
  }
}
```
cb: this.vm.dep.notify() 通知渲染 Watcher 去渲染

### 监听属性
vm 初始时会运行 initWatch
``` js
function initWatch (vm, watch) {
  for (var key in watch) {
    var handler = watch[key]
    createWatcher(vm, key, handler);
  }
}
```
会运行 createWatcher
``` js
function createWatcher(
  vm,
  expOrFn: String, // watch 名
  handler
) {
  return vm.$watch(expOrFn, handler, options)
}
```
会运行 Vue.portotype.$watch
``` js
Vue.prototype.$watch = function(
  expOrFn,
  cb,
  options
) {
  var vm = this;
  var watcher = new Watcher(vm, expOrFn, cb, options);
}
```
watch 在 Watch 构造函数分析
```js
constructor() {
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn
  } else {
    this.getter = parsePath(expOrFn)
  }
  this.value = this.get()
}
```
对 expOrFn 的判断很重要
watch 的 getter 就是从 parsePath 获取的
``` js
var bailRE = /[^\w.$]/;
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) { return }
      obj = obj[segments[i]];
    }
    return obj
  }
}
```
可以看出，根据key提取到的这个getter方法，其实是key路径最后的那个属性的值

构造函数最后还是会去执行
``` js
Watcher.prototype.get = function() {
  pushTarget(this);
  // 这里的get就是
  value = this.getter.call(vm, vm);
  popTarget();
}
```

### 组件更新
执行 Vue.prototype._update 
``` js
Vue.prototype._update =  function (vnode) {
  if (!prevVnode) {
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
     // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
}
```
会调用 patch 函数
``` js
function patch (oldVnode, vnode) {
  // 如果新节点为空 就移除旧节点
  if (isUndef(vnode)) {
    if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
    return
  }
  // 如果老的节点为空 就直接用新的节点创建 Element
  if (isUndef(oldVnode)) {
    // empty mount (likely as component), create new root element
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue)
  }
  // 表示老的节点和新的节点都存在 
  else {
    // 是相同的节点
    if (sameVnode(oldVnode, vnode)) {
      // 进行diff
      patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
    }
    // 不是相同的节点
    else {
      // 用新的节点生成新的node
      createElm(
        vnode,
        insertedVnodeQueue,
        oldElm._leaveCb ? null : parentElm,
        nodeOps.nextSibling(oldElm)
      )
      if (isDef(vnode.parent)) {
        // ... 更新父节点占位符
      }
      // 移除旧的节点
      invokeDestroyHook(oldVnode)
    }
  }
}
```
判断是否是相同的节点 sameVnode
``` js
function sameVnode (a, b) {
  return (
    a.key === b.key && // 是否是相同的key
    a.tag === b.tag && // tag 相同
    a.isComment === b.isComment && // 是否是组件
    isDef(a.data) === isDef(b.data) &&
    sameInputType(a, b)
  )
} 
```
如果新旧节点相同 就会执行 patchvnode 
``` js
function patchVnode (oldVnode, vnode) {
  // 执行 hook 上的 prepatch 函数
  if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
    i(oldVnode, vnode)
  }
  // 执行 hook 上的 update 函数
  if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)

  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    } else if (isDef(ch)) {
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      nodeOps.setTextContent(elm, '')
    }
  } else if (oldVnode.text !== vnode.text) {
    nodeOps.setTextContent(elm, vnode.text)
  }
  if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
}
```
主要是 patch 的过程
1. 判断新的节点下是否text 如果是text 就进行新旧节点text 的判断
2. 对新旧节点子元素进行新旧节点相同的判断，如果 ch 和 oldCh 同时存在就调用 diff
3. 旧节点存在 新节点不存在 就移除旧节点
4. 旧节点不存在 新节点存在 就创建新节点

diff 过程
``` js
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx]
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if(sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    }else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      if (isUndef(idxInOld)) { // New element
        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
      } else {
        vnodeToMove = oldCh[idxInOld]
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
          oldCh[idxInOld] = undefined
          canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
        } else {
          // same key but different element. treat as new element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        }
      }
      newStartVnode = newCh[++newStartIdx]
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }
}
```

## Vue Router 

### Vue.use

#### initUse
``` js
function initUse(Vue) {
  Vue.use = function (plugin) {
    // 获取 this._installedPlugins 已经存储的插件
    const installedPlugins = this._installedPlugins : []
    // 假如插件已经 use 过, 就不能执行下面的逻辑了
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }
    // 移除第一个参数 因为第一个参数是 plugin
    const args = toArray(arguments, 1)
    // 接下来要用到 args 的方法第一个参数就需要用的 Vue
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else {
      plugin.install.apply(plugin, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
```
可以看到 Vue 提供的插件注册机制很简单，每个插件都需要实现一个静态的 install 方法，当我们执行 Vue.use 注册插件的时候，就会执行这个 install 方法，并且在这个 install 方法的第一个参数我们可以拿到 Vue 对象，这样的好处就是作为插件的编写方不需要再额外去import Vue 了

#### 路由安装
Vue Router 类也实现了 install 方法
``` js
function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true
  _Vue = Vue
  // 注册实例
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }
  // 混合
  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
  // 访问 get 其实是访问 vm._routerRoot._router
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })
  // 访问 get 其实是访问 vm._routerRoot._route
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
}
```






















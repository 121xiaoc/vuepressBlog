# 浏览器

# 浏览器的进程和线程

## 1.浏览器是多进程的
浏览器是多进程的，打开浏览器的一个页面就可以看到浏览器打开的多个进程，包括 network 、GPU、标签、浏览器主进程

下面介绍一下进程和线程的关系
### 线程和进程的关系
线程：线程是用来处理任务的
进程：进程用来启动和管理线程，一个进程就是一个程序的运行实例

### 进程和线程的4个特点
1. 进程中的任一线程崩溃就会导致进程的崩溃
2. 线程之间共享进程的数据
3. 当一个进程关闭之后，操作系统会回收进程所占用的内存
4. 进程之间的内容相互隔离

### 目前浏览器的各个进程
1. 浏览器进程
2. 渲染进程
3. GPU 进程
4. 网络进程
5. 插件进程

浏览器的多进程确实提升了浏览器的稳定性、流畅性和安全性，但也不可避免的带来了一些问题
1. 更高的资源占用
2. 更复杂的体系架构

## 2.从输入URL到页面展示
1. 页面资源请求过程，浏览器进程会通过进程间通信把URL请求发送到网络进程，网络进程会去查询本地是否有缓存了该资源。

2. DNS解析 获取IP和端口

3. 进行TCP链接

4. 发送HTTP请求

5. 服务端返回数据

5. 网络进程根据服务端返回的数据进行处理
#### 重定向
如果网络进程解析到的响应头状态码是 301 或 302 那么就会根据响应头的 Location 字段进行重定向
#### 响应数据类型进行处理
浏览器根据 Content-Type 的值来决定显示的内容

6. 准备渲染进程进行渲染

7. 浏览器进程会通知渲染进程进行文档提交，渲染进程就会和网络进程建立管道，数据传输完成后将会通知浏览器进程传输完成

8. 渲染进程准备渲染

## process-per-site-instance
如果从一个页面打开了另一个新 页面，而新页面和当前页面属于同一站点的话，那么新页面会复用父页面的渲染进程


## 页面渲染
### 构建dom树
因为浏览器无法识别HTML所以要将HTML转化为dom树

### 转化CSS
1. 把 css 转化为浏览器能够理解的结构 也就是styleSheets
2. 转化样式表中的属性，使其标准化
3. 计算出 DOM 树每个节点的具体样式。这就涉及到 CSS 的继承规则和层叠规则了。

### 布局阶段
1. 创建布局树，构建一颗只包含可见元素布局树
2. 布局计算

### 分层
因为页面中有很多复杂效果，渲染引擎还需为特定的节点生成专用的图层，生成一颗对应的图层树
不是每个节点都包含一个图层，如果一个节点没有对应的层，那么这个节点就是从属于父节点的图层
1. 拥有图层上下文属性的元素会被提升为单独的一层
2. 需要剪裁的地方也会被创建为图层
::tip
层叠上下文
::

### 栅格化操作
当图层的绘制列表准备好之后，主线程会把该绘制列表提交给合成线程。合成线程会将图层划分为图块。合成线程会按照视口附近的图块来优先生成位图，实际生成位图的操作是由栅格化来执 行的。所谓栅格化，是指将图块转换为位图
### 合成和显示
一旦所有图块都被光栅化，合成线程就会生成一个绘制图块的命令——“DrawQuad”， 然后将该命令提交给浏览器进程
### 渲染流水线总结
1. 渲染进程将 HTML 内容转换为能够读懂的DOM 树结构
2. 渲染引擎将 CSS 样式表转化为浏览器可以理解的styleSheets，计算出 DOM 节点的样式。
3. 创建布局树，并计算元素的布局信息
4. 对布局树进行分层，并生成分层树。
5. 为每个图层生成绘制列表，并将其提交到合成线程
6. 合成线程将图层分成图块，并在光栅化线程池中将图块转换成位图
7. 合成线程发送绘制图块命令DrawQuad给浏览器进程
8. 浏览器进程根据 DrawQuad 消息生成页面，并显示到显示器上

DOM->Style->Layout->Layer->Paint
### 重排
例如修改了元素的高度，那么浏览器就会触发重新布局，解析之后的一系列流程，这个阶段叫做重排，重排需要更新完整的渲染流水线，所以开销也是最大
### 重绘
例如修改了元素的背景颜色，布局阶段将不会被执行，将会直接进入绘制阶段
### 合成阶段
更高一个既不要布局也不要绘制的属性，渲染引擎将会跳过布局和绘制，只执行后续的合成阶段，这个过程叫合成。如transform

## javascript 执行上下文
### 变量提升
javascript在执行之前会进行编译，在编译过程中会变量提升
### 代码的执行流程
先编译后执行
### 思考题
``` js
showName()
var showName = function() {
  console.log(2)
}
function showName() {
  console.log(1)
}
```
执行结果是 1
解释
1. 如果是同名函数，Javascript编译阶段会选择最后声明的那个
2. 如归变量和函数同名，那么在编译阶段，变量的声明会被忽略

## javascript 的块级作用域
作用域就是变量和函数的可访问范围
### var 的缺陷
1. 变量容易在不被察觉的情况下被覆盖掉
2. 本应销毁的变量没有被销毁
### let 和 const
站在执行上下文的角度来看javascript 是如何实现块级作用域的
作用域块中通过 let 声明的变量，会被存放在 词法环境的一个单独的区域中，这个区域中的变量并不影响作用域块外面的变量
在词法环境内部，维护了一个小型栈结构，栈底是函数最外层的变量，进入一个作用 域块后，就会把该作用域块内部的变量压到栈顶;当作用域执行完成之后，该作用域的信息 就会从栈顶弹出，这就是词法环境的结构

## 内存机制
### 内存空间
1. 代码空间
2. 栈空间
3. 堆空间

原始数据放在栈空间里 引用类型的数据放在堆中

### 垃圾回收
#### 栈中的数据
切换执行上下文的过程进行垃圾回收
#### 堆中的数据
就需要用到 javascript 中的垃圾回收器了

代际假说有2个特点：
大部分对象在内存中存在的时间很短
第二个是不死的对象，会活得更久。

V8引擎将堆分为新生代和老生代，新生代中存放的是生存时间短的对象，老生代中存放的是生存时间久的对象

副垃圾回收器，主要负责新生代的垃圾回收
主垃圾回收器，主要负责老生代的垃圾回收

不论什么类型的垃圾回收器，它们都有一套共同的执行流程。
1. 记空间中活动对象和非活动对象
2. 回收非活动对象所占据的内存
3. 内存整理

#### 副垃圾回收器
多数小的对象都会被分配到新生区，区域虽然不大，但是垃圾回收还是比较频繁的。

新生代中用Scavenge 算法来处理。所谓 Scavenge 算法，是把新生代空间对半划分为两个区域，一半是对象区域，一半是空闲区域

新加入的对象都会存放到对象区域，当对象区域快被写满时，就需要执行一次垃圾清理操作

在垃圾回收过程中，首先要对对象区域中的垃圾做标记;标记完成之后，就进入垃圾清理阶 段，副垃圾回收器会把这些存活的对象复制到空闲区域中，同时它还会把这些对象有序地排列起来，所以这个复制过程，也就相当于完成了内存整理操作，复制后空闲区域就没有内存碎片了。

种角色翻转的操 作还能让新生代中的这两块区域无限重复使用下去。

JavaScript 引擎采用了对象晋升策略，也就是经过两次垃圾回收依然还存活的对象，会被移动到老生区中。

#### 主垃圾回收器
老生区中的垃圾回收，老生区中的对象有两个特点：
1. 对象占用空间大，
2. 对象存活时间长

标记过程阶段。标记阶段就是从一组根元素开始，递归遍历这组根元素，在这个遍历 过程中，能到达的元素称为活动对象，没有到达的元素就可以判断为垃圾数据

标记过程和清除过程就是标记 - 清除算法，不过对一块内存多次执行标记 - 清除算法后，会产生大量不连续的内存碎片

而碎片过多会导致大对象无法分配到足够的连续内 存，于是又产生了另外一种算法——标记 - 整理

#### 全停顿
的，一旦执行垃圾回收算法，都需要将正在执行的 JavaScript 脚本暂停下来，待垃圾回收完毕后再恢复脚本执行。我们把这种行为叫做全停 顿

 将标记过程分为一个个的子标记过程，同时 让垃圾回收标记和 JavaScript 应用逻辑交替进行，直到标记阶段完成，我们把这个算法称 为增量标记

## 编译器和解释器
了解 编译器、解释器、抽象语法树、字节码、即时编译器

编译语言（C/C++,GO）在程序执行之前，需要编译器的编译，并且编译之后会保留机器能读懂的二进制文件

解释语言（javascript）每次运行都需要通过解释器进行动态解释和执行

V8 引擎既有解释器 又有编译器

分解其执行流程
1. 生成抽象语法树(AST)和执行上下文
2. 生成字节码
3. 执行代码
一段代码被重复执行多次，这种就称 为热点代码 那么后台的编译器 TurboFan 就会把该段热点的字节码编译为高效的机器 码，然后当再次执行这段被优化的代码时，只需要执行编译后的机器码就可以了，这样就大 大提升了代码的执行效率。

字节码配合解释器和编译器是最近一段时间很火的技术 这种技术称为即时编译

#### JavaScript 的性能优化
 V8 诞生之初，也出现过一系列针对 V8 而专门优化 JavaScript 性能的方案，比如 隐藏类、内联缓存等概念都是那时候提出来的，但是现在 优化的中心聚焦在单次脚本的执行时间和脚本的网络下载上，主要关注以下三点内容
 1. 单次脚本的执行速度
 2. 避免大的内联脚本，因为在解析 HTML 的过程中，解析和编译也会占用主线程
 3. 减少 JavaScript 文件的容量

 ## 消息队列和事件循环
 流程
 1. 添加一个消息队列
 2. IO 线程中产生新任务添加到消息队列底部
 3. 渲染主线程会循环地从消息队列头部中读取数据任务，执行任务

 渲染进程中专门有一个 IO 线程用来接收其他进程传通过IPC传进来的数据，放到消息队列 渲染主线程就会读取这些队列中的任务

#### 消息队列中的任务类型
宏任务: 消息队列中的任务
微任务: 每个宏任务中都包含了一个微任务队列

页面上的点击就属性宏任务

#### 解决单个任务执行时长过久的问题。
JavaScript 可以通过回调功能来规避这种问题，也就是让要执行的 JavaScript 任务滞后执行

### setTimeout 是如何实现的
执行一段异步 JavaScript 代码，也是需要将执行任务添加到消息队列中。
为了保证回调函数能在指定时间内执行，你不能将定时器的回调函数直接添加到消息队列中
渲染进程会将该定时器的回调任务添加到延迟队列中
设置一个定时器，JavaScript 引擎会返回一个定时器的 ID。那通常情况下，当一个定时器 的任务还没有被执行的时候，也是可以取消的，具体方法是调用clearTimeout 函数，并传 入需要取消的定时器的ID

#### 使用setTimeout的一些注意点
1. 如果当前任务执行时间过久，会影延迟到期定时器任务的执行
2. 如果 setTimeout 存在嵌套调用，那么系统会设置最短时间间隔为 4 毫秒
3. 未激活的页面，setTimeout 执行最小间隔是 1000 毫秒
4. 延时执行时间有最大值
5. 使用 setTimeout 设置的回调函数中的 this 不符合直觉

### WebApi: XMLHttpRequest是怎么实现的
![avatar](./static/images/share-browers-xmlHttpRequest.png)
#### XMLHttpRequest 使用过程中的 坑
1. 跨域问题
2. HTTPS 混合内容的问题

### 宏认为和微任务
微任务：微任务可以在实时性和效率之间做一个有效的权衡

宏任务
1. 渲染事件(如解析 DOM、计算布局、绘制);
2. 用户交互事件(如鼠标点击、滚动页面、放大缩小等)
3. JavaScript 脚本执行事件;
4. 网络请求完成、文件读写完成事件。

思考 用户交互事件是宏任务吗
``` js
// 鼠标监听事件
function displayDate(){
	console.log('时间改变了')
	document.getElementById("demo").innerHTML=Date();
}
function load(){
  // 宏任务
	setTimeout(() => {
		console.log('回调函数')
	}, 0)
	
	console.log('load 了')
	var startTime = +new Date()
	var nowDate = null
	while(true) {
		nowDate = +new Date()
		if(nowDate - startTime > 1000 * 10) {
      Promise.resolve().then(() => {
				console.log('promise 的回调')
			})
			break
		}
	}
	console.log('完成了')
}
```
是宏任务 但是其优先级确比 setTimeout 高

微任务
MutationObserver 将响应函数改成异步调用，可以不用在每次 DOM 变化都触发 异步调用，而是等多次 DOM 变化后，一次触发异步调用

MutationObserver 采用了“异步 + 微任务”的策略。
1. 通过异步操作解决了同步操作的性能问题
2. 通过微任务解决了实时性的问题。

### promise
#### 异步编程的问题
代码逻辑不连续

封装异步代码，让处理流程变得线性
但又导致了 回调地狱

#### Promise:消灭嵌套调用和多次错误处理

### async/await
用promise 消灭嵌套调用，但代码里依旧会包含太多的 then, 基于这个，ES7 引入了 async/await,这是 JavaScript 异步编程的一个重大改进,用同步代码的方式实现了异步访问资源的能力

实现 async/await 基础之一就是生成器(Generator) 
#### 生成器
``` js
function* genDemo() {
    console.log(" 开始执行第一段 ")
    yield 'generator 2'
 
    console.log(" 开始执行第二段 ")
    yield 'generator 2'
 
    console.log(" 开始执行第三段 ")
    yield 'generator 2'
 
    console.log(" 执行结束 ")
    return 'generator 2'
}
 
console.log('main 0')
let gen = genDemo()
console.log(gen.next().value)
console.log('main 1')
console.log(gen.next().value)
console.log('main 2')
console.log(gen.next().value)
console.log('main 3')
console.log(gen.next().value)
console.log('main 4')
```
生成器的具体使用方式
1. 在生成器函数内部执行一段代码，如果遇到 yield 关键字，将关键字后面的内容给外部，并暂停该函数的执行
2. 外部函数可以通过 next 方法恢复函数的执行

#### 协程
协程是一种比线程更加轻量级的存在
一个线程也可以拥有多个协程。最重要的是，协程不是被操作系统内核所管理，而完全是由程序所控制

#### async
根据 MDN 定义，async 是一个通过异步执行并隐式返回 Promise 作为结果的函数


## chrome 开发者工具
是一组网页制作和调试的工具

包含了 10 个功能面板，包括了 Elements、Console、Sources、NetWork、Performance、Memory、Application、Security、Audits 和 Layers。
![avatar](./static/images/21-1.png)

### 网络面板
网络面板由控制器、过滤器、时间线、详细列表和下载信息概要这 5 个区域构成
#### 控制器
有 4 个功能
1. 红色圆点的按钮，表示“开始 / 暂停抓包”
2. “全局搜索”按钮
3. Disable cache，即“禁止从 Cache 中加载资源”的功能
4. Online 按钮，是“模拟 2G/3G”功能

#### 过滤器
网络面板中的过滤器，主要就是起过滤功能

#### 抓图信息
可以用来分析用户等待页面加载时间内所看到的内容，勾选面板上的“Capture screenshots”即可启用屏幕截图

#### 时间线
主要用来展示 HTTP、HTTPS、WebSocket 加载的状态和时间的一个关系

#### 详细列表
这个区域是最重要的，它详细记录了每个资源从发起请求到完成请求这中间所有过程的状态

#### 下载信息概要
你要重点关注下 DOMContentLoaded 和 Load 两个事件
DOMContentLoaded： 这个事件发生后，说明页面已经构建好 DOM 了
Load，说明浏览器已经加载了所有的资源（图像、样式表等）。

### 网络面板中的详细列表的时间线
#### Queuing
排队的意思,导致请求处于排队状态的原因有很多
1. 首先，页面中的资源是有优先级的
2. 其次，我们前面也提到过，浏览器会为每个域名最多维护 6 个 TCP 连接
3. 网络进程在为数据分配磁盘空间时，新的 HTTP 请求也需要短暂地等待磁盘分配结束。

#### Stalled
停滞的意思 

#### Proxy Negotiation
代理协商阶段，它表示代理服务器连接协商所用的时间

#### Initial connection/SSL
建立 TCP 连接所花费的时间

#### Request sent 阶段
常这个阶段非常快，因为只需要把浏览器缓冲区的数据发送出去就结束了

#### Waiting
接收服务器第一个字节的数据，第一字节时间

### 优化
#### 1. 排队时间过久
大概率是由浏览器为每个域名最多维护 6 个连接导致的，基于这个原因，你就可以让 1 个站点下面的资源放在多个域名下面

#### 2. 第一字节时间过久
1. 服务器生成页面数据的时间过久
2. 网络的原因
3. 发送请求头时带上了多余的用户信息

#### 3. Content Download 
比如压缩、去掉源码中不必要的注释等方法


## Javascript 是如何影响DOM树构建的
### DOM 树是如何生成的
一个叫HTML 解析器（HTMLParser）的模块，它负责将 HTML 字节流转换为 DOM 结构
网络进程加载了多少数据，HTML 解析器便解析多少数据

解析到 script 脚本标签时，其 DOM 树结构如下所示
![avatar](./static/images/21-2.png)

执行到 JavaScript 标签时，暂停整个 DOM 的解析，执行 JavaScript 代码，不过这里执行 JavaScript 时，需要先下载这段 JavaScript 代码 JavaScript 文件的下载过程会阻塞 DOM 解析

如果 JavaScript 文件中没有操作 DOM 相关代码，就可以将该 JavaScript 脚本设置为异步加载，通过 async 或 defer 来标记代码 async 标志的脚本文件一旦加载完成，会立即执行；而使用了 defer 标记的脚本文件，需要在 DOMContentLoaded 事件之前执行

### 总结
我们知道了 JavaScript 会阻塞 DOM 生成，而样式文件又会阻塞 JavaScript 的执行，所以在实际的工程中需要重点关注 JavaScript 文件和样式表文件，使用不当会影响到页面性能的



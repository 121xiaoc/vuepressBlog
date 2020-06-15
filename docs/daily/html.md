# HTML
## 1.preload prefetch
(2020.06.15)
[script、link标签详解](https://blog.csdn.net/weixin_33804990/article/details/91423761)
``` html
<link rel="prefetch" as="script" href="example.js">
```
当确定网页在未来（下一页）一定会使用某资源时，可以通过prefetch提前请求资源并且缓存以供后续使用。但具体什么时候请求这个资源由浏览器决定。

``` html
<link rel="preload" as="script" href="example.js">
```
Preload是一项新的web标准，旨在提高性能和为开发人员提供更细粒度的加载控制. preload是声明式的fetch，可以强制浏览器请求资源，同时不阻塞文档onload事件

Preload支持onload事件，可以自定义资源加载完后的回调函数。
``` html
<link rel="proload" href="test.js" as="script" onload="console.log('finish');">
```

preload的as属性，告诉浏览器加载的是什么资源。常用的as属性值有：
script, style, image, media, document, font
通过设置as属性可以实现：
浏览器可以设置正确的资源加载优先级
浏览器可以确保请求是符合内容安全策略的
浏览器根据as的值发送正确的accept头部信息
浏览器根据as的值得知资源类型。因此当获取的资源相同时，浏览器能够判断前面获取的资源能否重用。
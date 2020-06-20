# 项目经验

## 1.无token
当没有token是,需要做的就是拦截住路由跳转,让用户跳转登录页

permission.js
```js
const hasToken = getToken()
if(hasToken) {
  // 不做任何操作
} else {
  // 拦截用户跳转登录
  // next(`/login?redirect=${to.path}`)
}

```

## 2.token过期
首先请求返回参数进行拦截,拦截到token过期进行重新登录弹窗(也可不弹窗),删除本地的token,重新刷新页面此时已无token,就会走入1步骤(也可直接跳转登录页)

```js
removeToken()
location.reload()
```
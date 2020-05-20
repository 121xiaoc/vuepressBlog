## 启动
### 基本配置
``` js
npm init -y
npm install webpack webpack-cli --save-dev
```
目录结构为
``` js
  webpack-demo
  |- package.json
  |- /dist
    |- index.html
  |- /src
    |- index.js
```
index.html 为

``` html
<!doctype html>
<html>
  <head>
    <title>起步</title>
  </head>
  <body>
    <script src="main.js"></script>
  </body>
</html>
```
``` js
// npm install --save lodash
import _ from 'lodash';
function component() {
  var element = document.createElement('div');
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  return element;
}

document.body.appendChild(component());
```

### 使用一个配置文件
增加 webpack.config.js
``` js
// node 的基础模块 path
const path = require('path')

module.exports = {
  // 入口文件
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    // 说明path必须是绝对路劲
    path: path.resolve(__dirname, 'dist')
  }
}
```
## 资源管理
不会打包未使用的资源文件
### 加载css
安装必需的loader
```js
npm install --save-dev style-loader css-loader
```
配置loader 
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
}
```
### 加载css中的图片和图标
安装必需的loader
```js
npm install --save-dev file-loader
```
可以识别import MyImage from './my-image.png' 也可以识别CSS中的 url('./my-image.png')
```js
module.exports = {
  module: {
    rules: [
      {
        text: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  }
}
```

### 加载css中的字体文件
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  }
}
```

### 加载数据
默认可以加载json,而XML,CSV,TSV需要loader
安装代码
```js
npm install --save-dev csv-loader xml-loader
```

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.(csv|tsv)$/,
        use: [
          'csv-loader'
        ]
      },
      {
        test: /\.xml$/,
        use: [
          'xml-loader'
        ]
      }
    ]
  }
};
```

## 管理输出
目前我们的index.html还是通过手动引入资源的,资源多了就很低效,webpack支持可以自动引入
### 设定 HtmlWebpackPlugin
安装插件
``` js
npm install --save-dev html-webpack-plugin
```

``` js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Output Management'
    })
  ],
}
```




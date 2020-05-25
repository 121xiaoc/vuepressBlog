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
## 1. 资源管理
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

## 2. 管理输出文件
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
### 清楚dist文件夹插件 
安装插件
```js
npm install --save-dev clean-webpack-plugin
```
```js {2}
// 引入CleabWebpackPlugib 是有双引号的
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  plugins: [
    new CleanWebpackPlugin()
  ],
}
```
### 生成Manifest
可以生成一个manifest.json记录文件的映射关系
安装插件
```js
npm install --save-dev webpack-manifest-plugin
```
```js
const WebpackManifestPlugin = require('webpack-manifest-plugin')
module.exports = {
  plugins: [
    new WebpackManifestPlugin()
  ],
}
```

## 3. 开发配置
### map source
不设置map source对于报错的源文件不知道是哪个
``` js
module.exports = {
  // 生产环境不用用 inline-source-map
  devtool: 'inline-source-map'
}
```
### 选择一个开发工具
可以在修改代码后自动构建
有几个不用的选项 但我只记录webpack-dev-server
安装
```js
npm install --save-dev webpack-dev-server
```
```js
module.exports = {
  devServer: {
    contentBase: './dist'
  },
}
```

## 4.模块热启动
它允许在运行时更新各种模块，而无需进行完全刷新
### 启用HMR
用webpack内置的HMR插件,和devServer的配置
``` js
module.exports = {
  devServer: {
    hot: true
  },
  pligins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
```

### 样式HRM
style-loader
```js {7}
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

## 5. tree shaking
用于移除 javascript 上下文中未引用代码
package.json
```js
{
  "name": "your-project",
  "sideEffects": false
}
// or
{
  "name": "your-project",
  "sideEffects": [
    "./src/some-side-effectful-file.js"
  ]
}
// or
{
  "name": "your-project",
  "sideEffects": [
    "./src/some-side-effectful-file.js",
    "*.css"
  ]
}
```
也可以在module.rules中设置"sideEffects"

### 开启代码压缩
将mode改为production就可以开启代码压缩
```js
module.exports = {
  mode: "production"
}
```

## 6. 生产环境构建
### 配置
将生产、开发、公共的配置用不同的文件区分开来
需要用到 webpack-merge
安装
``` js
npm install --save-dev webpack-merge
```
``` js
  webpack-demo
  |- package.json
- |- webpack.config.js
+ |- webpack.common.js
+ |- webpack.dev.js
+ |- webpack.prod.js
  |- /dist
  |- /src
    |- index.js
    |- math.js
  |- /node_modules
```
::: tip
因为webpack无法获取Node.precess.env
:::
webpack.common.js
``` js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  entry: {
    app: './src/demo6/index.js'
  },
  output: {
    filename: '[name].bundle[hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ]
}
```

webpack.dev.js
``` js
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  }
})
```

webpack.prod.js
``` js
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'source-map',
  mode: 'production'
})
```

::: warning
避免在生产中使用 inline-*** 和 eval-***，因为它们可以增加 bundle 大小，并降低整体性能。
:::

### 指定环境
有一些第三方插件需要用到process.env.NODE_ENV
webpack.prod.js
```js
const webpack = require('webpack')
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'precess.env.NODE_ENV': JSON.stringify('production')
    })
  ]
}
```
### 分割css
安装
``` js
npm install --save-dev extract-text-webpack-plugin
```
/* 11:17 */
## 7.代码分离
### 利用入口起点文件分离代码
创建一个other_module.js,为了和index.js引入相同的模块
``` js
import _ from 'lodash';

console.log(
  _.join(['Another', 'module', 'loaded!'], ' ')
);
```
入口分离的原理就是创建一个新的入口
webpack.common.js
``` js
module.exports = {
  entry: {
    app: './src/demo7/index.js',
    another: './src/demo7/other_module.js'
  }
}
```
::: warning
这种方法会导致一些问题
1、如果入口chunks之间包含重复的模块,那这些重复的模块就会被引入各个bundle中
2、不够灵活,并且不能将核心应用程序逻辑进行动态拆分代码(其实这个我不太懂)
第一点无疑是个问题
:::

### 防止模块重复
将已有入口chunk中提取公共的依赖模块,提取新生成的chunk
#### entry depenencies
``` js
module.exports = {
   entry: {
    index: { import: './src/index.js', dependOn: 'shared' },
    another: { import: './src/another-module.js', dependOn: 'shared' },
    shared: 'lodash',
    },
}
```
::: error
没有成功
:::

#### SplitChunksPlugin
拆分代码
webpack.prod.js 
``` js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  }
}
```

### 动态导入的进行拆分
index.js
``` js
console.log(
  import('lodash').then( _ => {
    _.join(['Another', 'module', 'loaded!'], ' ')
  })
);
```
这样就可以生成一个独立出来的bundle

webpack.common.js
``` js
module.exports = {
  output: {
    chunkFilename: '[name].bundle.js',
  }
}
```
可以对独立出来的bundle进行命名

### 动态导入代码优化preload和prefetch
[参考](https://www.jianshu.com/p/d2152789759d)
<link rel="prefetch" ></link>
这个资源将会在浏览器空闲时被下载 vue 中的话可以放到onMounted 感觉没啥用
<link rel="preload" ></link>
重要的资源,关键资源先下好


### 分析工具
webpack-bundle-analyzer

#### 官方自带工具
``` js
webpack --profile --json > stats.json
```
#### webpack chart
``` js
https://alexkuz.github.io/webpack-chart/
```
####  webpack-visualizer: 
安装
``` js
npm install --save-dev webpack-visualizer-plugin
```

webpack.prod.js
``` js
const Visualizer = require('webpack-visualizer-plugin')
module.exports = {
  plugins: [
    new Visualizer()
  ]
}
```

#### BundleAnalyzerPlugin
``` js
npm install --save-dev webpack-bundle-analyzer
```
config.prod.js
``` js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```

## 8 利用缓存
### 文件hash名
防止文件内容变了还有缓存
webpack.common.js
``` js
module.exports = {
  filename: '[name].[contenthash].js',
}
```
::: tip
文件内容修改,打包后文件名跟着修改,hash值变化,这样文件就不会有缓存
:::

### 通用代码提取
分为runtime生成的代码（老实说不知道为什么有提取出来,但官网写了）和第三方module

#### runtime 生成的代码
webpack.js
``` js {3}
module.exports = {
  optimization: {
    runtimeChunk: 'single'
  }
}
```
配置了这之后build就会生成一个runtime.b834744eb592e3e973fe.js,但其余文件没了hash值（解决办法在后面）（后台发现是因为设置了output的chunkFilename,设置了这个分出来的报包名字都以这个为准）

#### 第三方库抽离出来
第三方库一般不会发生变化,而每次去加载不太好,可以抽离出来成一个文件
webpack.js
``` js
module.exports = {
  optimization: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      chunks: 'all'
    }
  }
}
```
会生成一个name为vendors的包








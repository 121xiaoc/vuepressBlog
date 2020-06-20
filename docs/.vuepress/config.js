module.exports = {
  title: 'gezc blog',
  description: '我的个人网站',
  head: [ // 注入到当前页面的 HTML <head> 中的标签
    ['link', { rel: 'icon', href: '/logo.jpg' }], // 增加一个自定义的 favicon(网页标签的图标)
  ],
  base: '/', // 这是部署到github相关的配置
  markdown: {
    lineNumbers: true // 代码块显示行号
  },
  // head: [
  //   ['meta', { name: 'theme-color', content: '#3eaf7c' }]
  // ],
  // theme: '@vuepress/vue',
  themeConfig: {
    nav:[ // 导航栏配置
      {text: '前端基础', link: '/front-base/' },
      {text: '算法题库', link: '/algorithm/'},
      {text: '每日积累', link: '/daily/' }
    ],
    sidebar: {
      '/blog/': getThemeSidebar('测试', '介绍'),
      '/front-base/': getFrontBaseSidebar('前端基础', '介绍'),
      '/daily/': getDailySidebar('每日积累')
    }
  }
};

function getThemeSidebar (groupA, introductionA) {
  return [
    {
      title: groupA,
      collapsable: false,
      sidebarDepth: 2,
      children: [
        ['', introductionA]
      ]
    }
  ]
}

function getFrontBaseSidebar (groupA, introductionA) {
  return [
    {
      title: groupA,
      collapsable: false,
      sidebarDepth: 2,
      children: [
        ['', introductionA],
        ['source-code', '源码实现'],
        ['webpack-demo', 'webpack实践'],
        ['leet-code', '每日力扣']
      ]
    }
  ]
}

function getDailySidebar (groupA) {
  return [
    {
      title: groupA,
      collapsable: false,
      sidebarDepth: 2,
      children: [
        ['', '介绍'],
        ['html', '我的HTML'],
        ['css', '我的CSS'],
        ['js', '我的JS'],
        ['project', '我的项目'],
      ]
    }
  ]
}
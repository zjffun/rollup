---
layout: home

hero:
  name: rollup.js
  text: JavaScript 模块打包工具
  tagline: 将小块代码编译成更大更复杂的代码
  image: /rollup-logo.svg
  actions:
    - theme: brand
      text: 开始
      link: /introduction/
    - theme: alt
      text: GitHub
      link: https://github.com/rollup/rollup
features:
  - icon: 🌍
    title: Web、Node ……
    details: 'Rollup 支持多种输出格式：ES 模块、CommonJS、UMD、SystemJS 等。不仅适用于 Web，也适用于许多其他平台打包。'
    link: /configuration-options/#output-format
    linkText: 查看所有格式
  - icon: 🌳
    title: 摇树优化
    details: 基于深度执行路径分析的卓越的未使用代码去除，该工具将摇树优化引入 JavaScript 世界。
    link: /faqs/#what-is-tree-shaking
    linkText: 学习摇树优化
  - icon: 🗡️
    title: 代码拆分没有额外开销
    details: 根据不同的入口点和动态导入拆分代码，仅使用输出格式的导入机制而不是加载器。
    link: /tutorial/#code-splitting
    linkText: 如何使用代码拆分
  - icon: 🔌
    title: 强大的插件
    details: 一个易于学习的插件 API 允许您使用很少的代码实现强大的代码注入和转换。被 Vite 和 WMR 采用。
    link: /plugin-development/#plugins-overview
    linkText: 学习如何编写插件
  - icon: 🛠️
    title: 处理你的特殊需求
    details: Rollup 不固执己见。许多配置选项和丰富的插件接口使其成为特殊构建流程和更高级别工具的理想打包工具。
    link: /configuration-options/
    linkText: 查看所有选项
  - icon:
      src: /vitejs-logo.svg
    title: Vite 内部的打包工具
    details: 进行 Web 开发？Vite 使用合理的默认值和强大的插件为您预配置 Rollup，同时为您提供一个非常快速的开发服务器。
    link: https://vitejs.dev/
    linkText: 查看 Vite
---

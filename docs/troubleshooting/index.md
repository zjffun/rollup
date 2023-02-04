---
title: 错误排除
---

# {{ $frontmatter.title }}

[[toc]]

如果你遇到困难，请尝试在 [Rollup Discord](https://is.gd/rollup_chat) 上讨论问题或在 [Stackoverflow](https://stackoverflow.com/questions/tagged/rollupjs) 提问。如果你发现了错误，或者 Rollup 不能满足你的需求，请尝试[提 issue](https://github.com/rollup/rollup/issues)。最后，你可以尝试在 Twitter 上联系 [@RollupJS](https://twitter.com/RollupJS)。

## 避免使用 `eval`

你可能已经知道`eval`是邪恶的，至少在某些人看来是这样。但它对 Rollup 尤其有害，因为 Rollup 的工作方式——不像其他模块打包器将每个模块包装在一个函数中，Rollup 将所有代码放在同一个范围内。

这样效率更高，但这意味着只要你使用`eval`，共享范围就会被“污染”，而使用其他打包器，*没有*使用 eval 的模块将不会被污染。代码压缩工具无法在被“污染”的代码中去混淆变量名，因为它无法保证使用 eval 执行的代码不会再引用这些变量名。

此外，**它会带来安全风险**，因为恶意模块可以使用`eval('SUPER_SEKRIT')`访问另一个模块的私有变量。

幸运的是，如果你*确实*想要 eval 中执行的代码可以访问到局部变量的话（这种情况你很有可能在做一些错误的事情！），你可以在这两种方式中选择任意一种达到相同的效果：

### eval2 = eval

简单地“复制”`eval` 为你提供了一个几乎完全相同的函数，区别是它在全局作用域中执行而不是在局部作用域中：

```js
var eval2 = eval;

(function () {
	var foo = 42;
	eval('console.log("with eval:",foo)'); // logs 'with eval: 42'
	eval2('console.log("with eval2:",foo)'); // throws ReferenceError
})();
```

### `new Function`

使用[函数构造器](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)可以把提供的字符串参数创建为一个函数。同样，它也是在全局作用域运行的。如果你想要重复调用这个函数，这种方式会比使用 `eval` 快*很*多。

## 摇树优化似乎没有起作用

有些情况，最后你会在包中发现一些看起来不应该出现在这个地方的代码。比如，如果你从 `lodash-es` 中导入一个工具函数，你也许期望的是获取最少数量的但足以让这个工具函数正常运行的代码。

但是 Rollup 必须谨慎地对待它要移除的代码以确保最终的代码能够正确无误地运行。如果一个导入的模块是有*副作用*的，不管是在你使用的这个模块内还是在全局环境中，Rollup 将会以把副作用包含进来的安全的方式处理它。

由于静态分析在一门动态语言中如 JavaScript 是很困难的，所以偶尔会有误报。lodash 就是一个很好的示例，由于它*看起来*好像是一个有很多副作用的模块，尽管有些地方它并非如此。你通常可以通过引入子模块来消除这样的误报（比如：使用 `import map from 'lodash-es/map'` 替代 `import { map } from 'lodash-es'`）。

Rollup 的静态分析会逐渐优化提升，但是它不会在任何情况下都很完美––仅仅在 JavaScript 中如此。

## Error: "[name] is not exported by [module]"

有时你会看到这样的错误消息：

> 'foo' is not exported by bar.js (imported by baz.js)

导入声明必须在导入的模块中导出对应的声明。例如，如果你在一个模块中有 `import a from './a.js'`，同时 a.js 文件没有 `export default` 的声明，或者当你 `import {foo} from './b.js'`，同时 b.js 文件中没有导出 `foo`，那么 Rollup 无法打包这些代码。

这个错误经常出现在被 [rollup-plugin-commonjs](https://github.com/rollup/rollup-plugin-commonjs) 转换的 CommonJS 模块中，此包已废弃，不再维护。请使用 [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs#custom-named-exports)。

## Error: "this is undefined"

在一个 JavaScript 模块中，在顶级作用域（即函数外部）`this` 是 `undefined` 的。因此，Rollup 会重写所有的 `this` 引用为 `undefined`，使其最终的行为跟原生支持模块时的行为一致。

偶尔会有正当理由让 `this` 表示别的意思。如果你的 bundle 出现了错误，你可以使用 `options.context` 和 `options.moduleContext` 去改变这个行为。

## Warning: "Sourcemap is likely to be incorrect"

如果你给 bundle 生成了 sourcemap（`sourceMap: true` 或者 `sourceMap: 'inline'`），并且正在使用一个或多个转换代码的插件，但这些插件没有生成 sourcemap，你将看到此警告。

通常情况下，如果一个插件如果它（注意是插件，而不是你准备打包的项目）配置了 `sourceMap: false` 这种情况下不会生成 sourcemap – 你要做就是让这个插件做修改。如果这个插件没有生成 sourcemap，你可以尝试创建一个 issue 给这个插件的作者。

## Warning: "Treating [module] as external dependency"

Rollup 默认只会解析相对路径模块 ID。这意味着像这样的导入语句

```js
import moment from 'moment';
```

结果是 `moment` 并不会被包含在你的 bundle 中 –– 相反，它会是在运行时才需要被加载的外部模块。如果这是你想要的，你可以通过 `external` 选项来消除这些警告，来使你的意图更加清晰：

```js
// rollup.config.js
export default {
	entry: 'src/index.js',
	dest: 'bundle.js',
	format: 'cjs',
	external: ['moment'] // <-- suppresses the warning
};
```

如果你*确实*想要把这个模块包含在你的 bundle 中，你需要告诉 Rollup 怎么去找到它。在多数情况下，这是一个关于如何使用 [@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve) 的问题。

有些模块，比如 `events` 或者 `util` 这些 Node.js 的内置模块。如果你想要包含这些模块（例如，这么做可以使你的 bundle 就在浏览器环境也可以运行），你或许需要使用 [rollup-plugin-polyfill-node](https://github.com/FredKSchott/rollup-plugin-polyfill-node)。

## Error: "EMFILE: too many open files"

对于大型项目，在 macOS 上以 watch 模式运行 Rollup 时可能会遇到 EMFILE 错误。如果遇到这种情况，禁用 FSEvents 可能会解决问题：

```js
// rollup.config.js
export default {
  ...,
  watch: {
    chokidar: {
      useFsEvents: false
    }
  }
};
```

## Error: JavaScript heap out of memory

由于 Rollup 需要同时将所有模块信息保存在内存中，以便能够分析摇树优化的相关副作用，因此打包大型项目可能会达到 Node 的内存限制。如果发生这种情况，可以通过增加内存限制运行 Rollup

```shell
node --max-old-space-size=8192 node_modules/rollup/dist/bin/rollup -c
```

根据需要增加 `--max-old-space-size` 来解决。请注意，此数字可以安全地超过你的可用物理内存。在这种情况下，Node 将根据需要使用磁盘作为内存。

你可以通过使用动态导入引入代码拆分、仅导入特定模块而不是整个依赖项、禁用 sourcemap 或增加 swap 大小来减少内存压力。

## Error: Node tried to load your configuration file as CommonJS even though it is likely an ES module

默认情况下，Rollup 将使用 Node 的原生模块机制来加载你的 Rollup 配置。这意味着如果你在配置中使用 ES 导入和导出，则需要在 `package.json` 文件中定义 `"type": "module"` 或为你的配置使用 `.mjs` 扩展名。另请参阅 [配置文件](../command-line-interface/index.md#configuration-files) 和 [使用原生 Node ES 模块时的注意事项](../command-line-interface/index.md#caveats-when-using-native-node-es-modules）了解更多信息。

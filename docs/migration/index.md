---
title: 迁移到 Rollup 3
---

# {{ $frontmatter.title }}

[[toc]]

这是你在迁移到 Rollup 3 时可能遇到的最重要主题的列表。有关无法向下兼容的完整列表，我们建议你查阅

- [Rollup 3 变更日志](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#300)

从 Rollup 1 或更早版本迁移时，另请参阅

- [Rollup 2 变更日志](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#200)
- [Rollup 1 变更日志](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#100)

## 先决条件

确保使用 Node 14.18.0 及以上版本，并将所有 Rollup 插件更新到最新版本。

对于较大的配置，首先更新到 `rollup@2.79.1` 是有意义的，将 [`strictDeprecations`](../configuration-options/index.md#strictdeprecations) 选项添加到你的配置并解决弹出的所有错误。这样你就可以确保你不依赖 Rollup 3 中可能已删除的功能。如果你的插件有错误，请联系插件作者。

## 使用配置文件

如果你使用 ES 模块作为配置文件，即 `import` 和 `export` 语法，你需要确保 Node 将加载你的配置作为 ES 模块。

确保这一点的最简单方法是将文件扩展名更改为 `.mjs`，另请参阅[配置文件](../command-line-interface/index.md#configuration-files)。

使用原生 Node ES 模块时还有一些额外的注意事项，最值得注意的是

- 你不能简单地导入你的 `package.json` 文件
- 你不能使用 `__dirname` 来获取当前目录

[使用原生 Node ES 模块时的注意事项](../command-line-interface/index.md#caveats-when-using-native-node-es-modules)将为你提供一些处理这些事情的替代方案。

或者，你可以传递 [`--bundleConfigAsCjs`](../command-line-interface/#bundleconfigascjs) 选项以强制执行旧的加载行为。

如果你使用 [`--configPlugin`](../command-line-interface/#configplugin-plugin) 选项，Rollup 现在会在运行之前将你的配置打包为 ES 模块而不是 CommonJS。这允许你轻松地从你的配置中导入 ES 模块，但与使用原生 ES 模块有相同的注意事项，例如 `__dirname` 将无法使用。同样，你可以传递 [`--bundleConfigAsCjs`](../command-line-interface/#bundleconfigascjs) 选项以强制执行旧的加载行为。

## 更改默认值

一些选项现在有不同的默认值。如果你认为遇到任何问题，请尝试将以下内容添加到你的配置中：

```js
({
	makeAbsoluteExternalsRelative: true,
	preserveEntrySignatures: 'strict',
	output: {
		esModule: true,
		generatedCode: {
			reservedNamesAsProps: false
		},
		interop: 'compat',
		systemNullSetters: false
	}
});
```

不过，总的来说，新的默认值是我们推荐的设置。有关详细信息，请参阅每个设置的文档。

## 更多更改选项

- [`output.banner/footer`](../configuration-options/#output-banner-output-footer)[`/intro/outro`](../configuration-options/#output-intro-output-outro) 现在每个块都会调用，因此不应执行任何性能繁重的操作。
- [`entryFileNames`](../configuration-options/#output-entryfilenames) 和 [`chunkFileNames`](../configuration-options/#output-chunkfilenames) 函数不再可以通过 `modules` 访问呈现的模块信息，而只能访问包含的 `moduleIds` 列表。
- 使用 [`output.preserveModules`](../configuration-options/index.md#output-preservemodules) 和 `entryFileNames` 时，你不能再使用 `[ext]`、`[extName]` 和 `[assetExtName]` 文件名占位符。此外，模块的路径不再自动添加到文件名前，而是包含在 `[name]` 占位符中。

## CommonJS 输出的动态导入

默认情况下，在生成 `cjs` 输出时，Rollup 现在将保留任何外部的（即非打包的）动态导入作为 `import(…)` 输出中的表达式。这在从 Node 14 开始的所有 Node 版本中都受支持，并允许从生成的 CommonJS 输出加载 CommonJS 和 ES 模块。如果你需要支持旧的 Node 版本，你可以设置[`output.dynamicImportInCjs: false`](../configuration-options/#output-dynamicimportincjs)。

## 插件 API 的更改

我们对一般输出生成流程进行了重新设计，请参阅[输出生成勾子](../plugin-development/#output-generation-hooks) 图以了解新的插件勾子顺序。可能最明显的变化是[`banner`](../plugin-development/#banner)、[`footer`](../plugin-development/#footer)、[`intro`](../plugin-development/#intro) 和 [`outro`](../plugin-development/#outro)不再在开始时调用一次，而是每个块调用一次。另一方面，[`augmentChunkHash`](../plugin-development/#augmentchunkhash) 现在在 [`renderChunk`](../plugin-development/#renderchunk) 后创建哈希。

由于文件哈希现在基于 `renderChunk` 之后文件的实际内容，因此在生成哈希之前我们不再知道确切的文件名。 相反，逻辑现在依赖于 `!~{001}~` 形式的哈希占位符。这意味着 `renderChunk` 勾子可用的所有文件名都可能包含占位符，并且可能与最终文件名不对应。如果你计划在块中使用这些文件名，这不是问题，因为 Rollup 将在 [`generateBundle`](../plugin-development/#generatebundle) 运行之前替换所有占位符。

不一定是无法向下兼容的更改，但添加或删除导入的插件 [`renderChunk`](../plugin-development/#renderchunk) 应确保它们也更新 `chunk` 传递给此勾子的相应信息。这将使其他插件能够依赖准确的块信息，而无需自己处理块。有关详细信息，请参阅勾子的[文档](../plugin-development/#renderchunk)。

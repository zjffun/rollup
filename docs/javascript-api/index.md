---
title: JavaScript API
---

# {{ $frontmatter.title }}

[[toc]]

Rollup 提供可以通过 Node.js 来使用的 JavaScript API。除非你想扩展 Rollup 本身，或者用于一些高级的任务，例如用编程的方式把 bundle 生成出来，否则你将很少使用 JavaScript API，而且很可能使用命令行接口。

## rollup.rollup

`rollup.rollup` 函数接收输入选项对象作为参数，并返回一个 Promise，该 Promise 解析为具有各种属性和方法的 `bundle` 对象，如下所示。在此步骤中，Rollup 将构建模块图并执行摇树优化，但不会生成任何输出。

在 `bundle` 对象上，你可以使用不同的输出选项对象多次调用 `bundle.generate`，以在内存中生成不同的 bundle。如果直接将它们写入磁盘，请改用 `bundle.write`。

一旦你结束使用 `bundle` 对象，你应该调用 `bundle.close()`，这将让插件通过 [`closeBundle`](../plugin-development/index.md#closebundle) 钩子清理它们的外部进程或服务。

如果在任一阶段发生错误，它将返回一个被拒绝的 `Promise`，被拒绝的原因是错误对象，你可以通过错误对象的 `code` 属性来识别。除了 `code` 和 `message` 之外，许多错误还具有可用于自定义报告的其他属性，请参阅 [`utils/error.ts`](https://github.com/rollup/rollup/blob/master/src/utils/error.ts）以获得完整的错误和警告列表及其错误码和属性。

```javascript
import { rollup } from 'rollup';

// 有关这些选项的详细信息，请参见下文
const inputOptions = {...};

// 你可以从同一输入生成多个输出，例如 CommonJS 和 ESM 不同的格式
const outputOptionsList = [{...}, {...}];

build();

async function build() {
  let bundle;
  let buildFailed = false;
  try {
    // 创建一个bundle
    bundle = await rollup(inputOptions);

    // 该bundle所依赖的文件名数组
    console.log(bundle.watchFiles);

    await generateOutputs(bundle);
  } catch (error) {
    buildFailed = true;
    // 做一些错误报告
    console.error(error);
  }
  if (bundle) {
    // 关闭bundle
    await bundle.close();
  }
  process.exit(buildFailed ? 1 : 0);
}

async function generateOutputs(bundle) {
  for (const outputOptions of outputOptionsList) {
    // generate output specific code in-memory
    // you can call this function multiple times on the same bundle object
    // replace bundle.generate with bundle.write to directly write to disk
    const { output } = await bundle.generate(outputOptions);

    for (const chunkOrAsset of output) {
      if (chunkOrAsset.type === 'asset') {
        // For assets, this contains
        // {
        //   fileName: string,              // the asset file name
        //   source: string | Uint8Array    // the asset source
        //   type: 'asset'                  // signifies that this is an asset
        // }
        console.log('Asset', chunkOrAsset);
      } else {
        // For chunks, this contains
        // {
        //   code: string,                  // the generated JS code
        //   dynamicImports: string[],      // external modules imported dynamically by the chunk
        //   exports: string[],             // exported variable names
        //   facadeModuleId: string | null, // the id of a module that this chunk corresponds to
        //   fileName: string,              // the chunk file name
        //   implicitlyLoadedBefore: string[]; // entries that should only be loaded after this chunk
        //   imports: string[],             // external modules imported statically by the chunk
        //   importedBindings: {[imported: string]: string[]} // imported bindings per dependency
        //   isDynamicEntry: boolean,       // is this chunk a dynamic entry point
        //   isEntry: boolean,              // is this chunk a static entry point
        //   isImplicitEntry: boolean,      // should this chunk only be loaded after other chunks
        //   map: string | null,            // sourcemaps if present
        //   modules: {                     // information about the modules in this chunk
        //     [id: string]: {
        //       renderedExports: string[]; // exported variable names that were included
        //       removedExports: string[];  // exported variable names that were removed
        //       renderedLength: number;    // the length of the remaining code in this module
        //       originalLength: number;    // the original length of the code in this module
        //       code: string | null;       // remaining code in this module
        //     };
        //   },
        //   name: string                   // the name of this chunk as used in naming patterns
        //   referencedFiles: string[]      // files referenced via import.meta.ROLLUP_FILE_URL_<id>
        //   type: 'chunk',                 // signifies that this is a chunk
        // }
        console.log('Chunk', chunkOrAsset.modules);
      }
    }
  }
}
```

### inputOptions 对象

`inputOptions` 对象可以包含以下属性（有关这些的完整详细信息，请参阅[选项大列表](../configuration-options/index.md)）：

```js
const inputOptions = {
	// core input options
	external,
	input, // conditionally required
	plugins,

	// advanced input options
	cache,
	onwarn,
	preserveEntrySignatures,
	strictDeprecations,

	// danger zone
	acorn,
	acornInjectPlugins,
	context,
	moduleContext,
	preserveSymlinks,
	shimMissingExports,
	treeshake,

	// experimental
	experimentalCacheExpiry,
	perf
};
```

### outputOptions 对象

`outputOptions` 对象可以包含以下属性（有关这些的完整详细信息，请参阅[选项大列表](../configuration-options/index.md)）：

```js
const outputOptions = {
	// core output options
	dir,
	file,
	format, // required
	globals,
	name,
	plugins,

	// advanced output options
	assetFileNames,
	banner,
	chunkFileNames,
	compact,
	entryFileNames,
	extend,
	externalLiveBindings,
	footer,
	hoistTransitiveImports,
	inlineDynamicImports,
	interop,
	intro,
	manualChunks,
	minifyInternalExports,
	outro,
	paths,
	preserveModules,
	preserveModulesRoot,
	sourcemap,
	sourcemapExcludeSources,
	sourcemapFile,
	sourcemapPathTransform,
	validate,

	// danger zone
	amd,
	esModule,
	exports,
	freeze,
	indent,
	namespaceToStringTag,
	noConflict,
	preferConst,
	sanitizeFileName,
	strict,
	systemNullSetters
};
```

## rollup.watch

Rollup 还提供了一个 `rollup.watch` 函数，当它检测到磁盘上的各个模块发生变化时，它会重建你的 bundle。当你使用 `--watch` 标志从命令行运行 Rollup 时，它在内部使用。请注意，当通过 JavaScript API 使用监视模式时，你有责任调用 `event.result.close()` 以响应 `BUNDLE_END` 事件，以允许插件通过 [`closeBundle`](../plugin-development/index.md#closebundle) 钩子清理资源，见下文。

```js
const rollup = require('rollup');

const watchOptions = {...};
const watcher = rollup.watch(watchOptions);

watcher.on('event', event => {
  // event.code can be one of:
  //   START        — the watcher is (re)starting
  //   BUNDLE_START — building an individual bundle
  //                  * event.input will be the input options object if present
  //                  * event.output contains an array of the "file" or
  //                    "dir" option values of the generated outputs
  //   BUNDLE_END   — finished building a bundle
  //                  * event.input will be the input options object if present
  //                  * event.output contains an array of the "file" or
  //                    "dir" option values of the generated outputs
  //                  * event.duration is the build duration in milliseconds
  //                  * event.result contains the bundle object that can be
  //                    used to generate additional outputs by calling
  //                    bundle.generate or bundle.write. This is especially
  //                    important when the watch.skipWrite option is used.
  //                  You should call "event.result.close()" once you are done
  //                  generating outputs, or if you do not generate outputs.
  //                  This will allow plugins to clean up resources via the
  //                  "closeBundle" hook.
  //   END          — finished building all bundles
  //   ERROR        — encountered an error while bundling
  //                  * event.error contains the error that was thrown
  //                  * event.result is null for build errors and contains the
  //                    bundle object for output generation errors. As with
  //                    "BUNDLE_END", you should call "event.result.close()" if
  //                    present once you are done.
  // If you return a Promise from your event handler, Rollup will wait until the
  // Promise is resolved before continuing.
});

// This will make sure that bundles are properly closed after each run
watcher.on('event', ({ result }) => {
  if (result) {
  	result.close();
  }
});

// Additionally, you can hook into the following. Again, return a Promise to
// make Rollup wait at that stage:
watcher.on('change', (id, { event }) => { /* a file was modified */ })
watcher.on('restart', () => { /* a new run was triggered */ })
watcher.on('close', () => { /* the watcher was closed, see below */ })

// to stop watching
watcher.close();
```

### watchOptions

`watchOptions` 参数是你将从配置文件导出的配置（或配置数组）。

```js
const watchOptions = {
	...inputOptions,
	output: [outputOptions],
	watch: {
		buildDelay,
		chokidar,
		clearScreen,
		skipWrite,
		exclude,
		include
	}
};
```

有关 `inputOptions` 和 `outputOptions` 的详细信息，请参阅上文，或查阅[选项大列表](../configuration-options/index.md) 以获取有关 `chokidar`、`include` 和 `exclude` 的信息。

### 以编程方式加载配置文件

为了帮助生成这样的配置，rollup 公开了它用于通过单独的入口点在其命令行界面中加载配置文件的函数。这个函数接收一个解析后的 `fileName` 和一个可选的包含命令行参数的对象：

```js
const { loadConfigFile } = require('rollup/loadConfigFile');
const path = require('node:path');
const rollup = require('rollup');

// load the config file next to the current script;
// the provided config object has the same effect as passing "--format es"
// on the command line and will override the format of all outputs
loadConfigFile(path.resolve(__dirname, 'rollup.config.js'), {
	format: 'es'
}).then(async ({ options, warnings }) => {
	// "warnings" wraps the default `onwarn` handler passed by the CLI.
	// This prints all warnings up to this point:
	console.log(`We currently have ${warnings.count} warnings`);

	// This prints all deferred warnings
	warnings.flush();

	// options is an array of "inputOptions" objects with an additional
	// "output" property that contains an array of "outputOptions".
	// The following will generate all outputs for all inputs, and write
	// them to disk the same way the CLI does it:
	for (const optionsObj of options) {
		const bundle = await rollup.rollup(optionsObj);
		await Promise.all(optionsObj.output.map(bundle.write));
	}

	// You can also pass this directly to "rollup.watch"
	rollup.watch(options);
});
```

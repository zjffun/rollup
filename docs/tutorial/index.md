---
title: 教程
---

# {{ $frontmatter.title }}

[[toc]]

## 创建第一个 bundle

_开始前, 你需要安装 [Node.js](https://nodejs.org)，这样你才可以使用 [NPM](https://npmjs.com)；你还需要了解如何使用[命令行](https://www.codecademy.com/learn/learn-the-command-line)。_

使用 Rollup 最简单的方法是通过命令行界面。先全局安装 Rollup（之后会介绍如何在项目中进行安装，更便于打包，但现在不用担心这个问题）。在命令行中输入以下内容：

```shell
npm install rollup --global
# 或者 `npm i rollup -g`
```

现在可以运行 `rollup` 命令了。试试吧！

```shell
rollup
```

由于没有传递参数，所以 Rollup 打印出了使用说明。这和运行 `rollup --help` 或 `rollup -h` 的效果一样。

我们来创建一个简单的项目：

```shell
mkdir -p my-rollup-project/src
cd my-rollup-project
```

首先，我们需要个入口文件。将以下代码粘贴到新建的文件 `src/main.js` 中：

```js
// src/main.js
import foo from './foo.js';
export default function () {
	console.log(foo);
}
```

之后创建入口文件引用的 `foo.js` 模块：

```js
// src/foo.js
export default 'hello world!';
```

现在可以创建 bundle 了：

```shell
rollup src/main.js -f cjs
```

`-f` 选项（`--output.format` 的缩写）指定了所创建 bundle 的类型——这里是 CommonJS（在 Node.js 中运行）。由于没有指定输出文件，所以会直接打印在 `stdout` 中：

```js
'use strict';

const foo = 'hello world!';

const main = function () {
	console.log(foo);
};

module.exports = main;
```

也可以像下面一样将 bundle 保存为文件：

```shell
rollup src/main.js -o bundle.js -f cjs
```

（你也可以用 `rollup src/main.js -f cjs > bundle.js`，但是我们之后会提到，这种方法在生成 sourcemap 时灵活性不高。）

试着运行下面的代码：

```
node
> var myBundle = require('./bundle.js');
> myBundle();
'hello world!'
```

恭喜，你已经用 Rollup 完成了第一个 bundle。

## 使用配置文件

上面的方式还不错，但是如果添加更多的选项，这种命令行的方式就显得麻烦了。

为此，我们可以创建配置文件来囊括所需的选项。配置文件由 JavaScript 写成，比 CLI 更加灵活。

在项目中创建一个名为 `rollup.config.js` 的文件，增加如下代码：

```js
// rollup.config.js
export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	}
};
```

(注意你可以使用 `module.exports = {/* config */}` 这样的 CJS)

我们用 `--config` 或 `-c` 来使用配置文件：

```shell
rm bundle.js # so we can check the command works!
rollup -c
```

你可以使用等效的命令行选项覆盖配置文件中的任何选项：

```shell
rollup -c -o bundle-2.js # `-o` is equivalent to `--file` (formerly "output")
```

_注：Rollup 本身会处理配置文件，这就是为什么我们能够使用 `export default` 语法的原因——代码不会使用 Babel 或类似的东西进行转译，因此你只能使用你正在运行的 Node.js 版本支持的 ES2015 功能。_

如果愿意的话，也可以指定与默认 `rollup.config.js` 文件不同的配置文件：

```shell
rollup --config rollup.config.dev.js
rollup --config rollup.config.prod.js
```

## 安装本地的 Rollup

当处于团队合作或分布式环境时，添加 Rollup 作为本地依赖是非常适合的。安装本地 Rollup，多个贡献者不需要再单独安装 Rollup，并且保证所有贡献者使用相同的 Rollup 版本。

使用 NPM 安装本地 Rollup：

```shell
npm install rollup --save-dev
```

或者使用 Yarn：

```shell
yarn -D add rollup
```

在安装完成之后，在项目根目录下可以运行 Rollup：

```shell
npx rollup --config
```

或者使用 Yarn：

```shell
yarn rollup --config
```

安装完成后，一般会在 `package.json` 中会新增一个打包脚本，提供给所有贡献者一个便捷的命令。例如：

```json
{
	"scripts": {
		"build": "rollup --config"
	}
}
```

_注：一旦本地安装完成，当调用 package 脚本中的命令时，NPM 和 Yarn 都会解析依赖的 bin 文件并且执行 Rollup。_

## 使用插件

目前为止，我们通过相对路径，将一个入口文件和一个模块创建成了一个简单的 bundle。随着构建更复杂的 bundle，通常需要更大的灵活性——引入 NPM 安装的模块、通过 Babel 编译代码、和 JSON 文件打交道等。

为此，我们可以用*插件*在打包的关键过程中更改 Rollup 的行为。[Rollup 优秀列表](https://github.com/rollup/awesome)中维护着一些优秀的插件。

在本篇教程中，我们将使用 [@rollup/plugin-json](https://github.com/rollup/plugins/tree/master/packages/json)，其允许 Rollup 从一个 JSON 文件中导入数据。

在项目根目录下创建一个名叫 `package.json` 的文件，并添加以下内容：

```json
{
	"name": "rollup-tutorial",
	"version": "1.0.0",
	"scripts": {
		"build": "rollup -c"
	}
}
```

安装 @rollup/plugin-json 作为开发依赖：

```shell
npm install --save-dev @rollup/plugin-json
```

（使用 `--save-dev` 而不是 `--save` 是因为我们的代码在运行时并不依赖于插件，其只在我们打包 bundle 时用到。）

更新 `src/main.js` 文件，将导入 `src/foo.js` 替换为导入 package.json：

```js
// src/main.js
import { version } from '../package.json';

export default function () {
	console.log('version ' + version);
}
```

修改你的 `rollup.config.js` 文件，使其包含这个 JSON 插件：

```js
// rollup.config.js
import json from '@rollup/plugin-json';

export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	plugins: [json()]
};
```

使用 `npm run build` 命令运行 Rollup。运行结果应该像这样：

```js
'use strict';

var version = '1.0.0';

function main() {
	console.log('version ' + version);
}

module.exports = main;
```

_注: 只有我们确实需要的数据会被导入––`name`、`devDependencies` 以及 `package.json` 中的其他部分是会被忽略的。这是因为 **摇树优化** 在起作用。_

## 使用输出插件

一些插件专门应用于输出中。查阅[插件勾子](../plugin-development/index.md#build-hooks)了解关于输出特定插件能做的更多技术细节。总的来说，这些插件仅仅只可以在 Rollup 的主要代码分析完成之后，才可以修改代码。如果一个不适用的插件被当作输出特定插件使用的时候，Rollup 会给出警告。一个可能出现的场景是，压缩在浏览器中使用的 bundle。

我们来扩展下之前的例子，提供一个压缩打包和一个不压缩打包的示例。接下来，安装 `rollup-plugin-terser`：

```shell
npm install --save-dev @rollup/plugin-terser
```

修改你的 `rollup.config.js` 文件，增加第二项压缩输出。格式选择 `iife`。这种格式下包裹代码在浏览器中能够通过 `script` 标签自执行，同时避免与其他代码产生不想要的交互。当我们导出时，需要提供生成 bundle 时创建的全局变量，这样其他代码可以通过该变量使用导出的代码。

```js
// rollup.config.js
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
	input: 'src/main.js',
	output: [
		{
			file: 'bundle.js',
			format: 'cjs'
		},
		{
			file: 'bundle.min.js',
			format: 'iife',
			name: 'version',
			plugins: [terser()]
		}
	],
	plugins: [json()]
};
```

除了 `bundle.js`，Rollup 会创建第二个文件 `bundle.min.js`：

```js
var version = (function () {
	'use strict';
	var n = '1.0.0';
	return function () {
		console.log('version ' + n);
	};
})();
```

## 代码分割

就代码分割来说，Rollup 有很多场景自动将代码分割成块，例如动态加载或者多入口文件，通过 [`output.manualChunks`](../configuration-options/index.md#output-manualchunks) 配置项告可以显示地告诉 Rollup 哪些模块需要分割成块。

为了使用代码分割特性来完成动态懒加载 (仅在一个函数执行之后加载其导入的模块)，我们回到最初的例子并修改 `src/main.js`，将加载 `src/foo.js` 由静态加载改为动态加载：

```js
// src/main.js
export default function () {
	import('./foo.js').then(({ default: foo }) => console.log(foo));
}
```

Rollup 将采用动态导入的方式去构建一个仅在需要时加载的块。为了能让 Rollup 知道将块放在哪里，我们会使用 `--dir` 来替换 `--file` 可选项，来设置一个文件夹用于输出：

```shell
rollup src/main.js -f cjs -d dist
```

这将会创建一个 `dist` 文件夹，其中包含两个文件：`main.js` 和 `chunk-[hash].js`，这里的 `[hash]` 是基于内容和哈希字符串。你可以通过设置 [`output.chunkFileNames`](../configuration-options/index.md#output-chunkfilenames) 和 [`output.entryFileNames`](../configuration-options/index.md#output-entryfilenames) 选项提供自己的命名模式。

你仍然可以像以前一样运行你的代码并获得相同的输出，尽管会稍微慢一些，因为 `./foo.js` 的加载和解析只会在我们第一次调用导出函数后才开始。

```shell
node -e "require('./dist/main.js')()"
```

如果我们没有使用 `--dir` 可选项，Rollup 将会再次将块打印到 `stdout` 中，添加注释来指示这个块的边界：

```js
//→ main.js:
'use strict';

function main() {
	Promise.resolve(require('./chunk-b8774ea3.js')).then(({ default: foo }) =>
		console.log(foo)
	);
}

module.exports = main;

//→ chunk-b8774ea3.js:
('use strict');

var foo = 'hello world!';

exports.default = foo;
```

如果你想加载和编译仅一次使用的少见特性，这是有用的。

代码分割的另一个用途是能够区分多个入口，这些入口共享相同依赖。再次扩展我们的例子，增加第二个入口 `src/main2.js` 并像之前最原始的例子中的做法一样静态导入 `src/foo.js`：

```js
// src/main2.js
import foo from './foo.js';
export default function () {
	console.log(foo);
}
```

如果我们添加这两个入口文件到 rollup 中，会构建出三个块：

```shell
rollup src/main.js src/main2.js -f cjs
```

将会输出

```js
//→ main.js:
'use strict';

function main() {
	Promise.resolve(require('./chunk-b8774ea3.js')).then(({ default: foo }) =>
		console.log(foo)
	);
}

module.exports = main;

//→ main2.js:
('use strict');

var foo_js = require('./chunk-b8774ea3.js');

function main2() {
	console.log(foo_js.default);
}

module.exports = main2;

//→ chunk-b8774ea3.js:
('use strict');

var foo = 'hello world!';

exports.default = foo;
```

请注意两个入口点如何导入相同的共享块。Rollup 永远不会重复代码，而是创建额外的块来只加载最低限度的必要代码。同样，传递 `--dir` 选项会将文件写入磁盘。

你可以通过原生 ES 模块、AMD 加载器或 SystemJS 为浏览器构建相同的代码。

例如，使用 `-f es` 构建原生模块:

```shell
rollup src/main.js src/main2.js -f es -d dist
```

```html
<!DOCTYPE html>
<script type="module">
	import main2 from './dist/main2.js';
	main2();
</script>
```

或者，使用 `-f system` 构建 SystemJS：

```shell
rollup src/main.js src/main2.js -f system -d dist
```

安装 SystemJS 通过

```shell
npm install --save-dev systemjs
```

然后根据需要在 HTML 页面中加载一个或两个入口点：

```html
<!DOCTYPE html>
<script src="node_modules/systemjs/dist/s.min.js"></script>
<script>
	System.import('./dist/main2.js').then(({ default: main }) => main());
</script>
```

请参阅 [rollup-starter-code-splitting](https://github.com/rollup/rollup-starter-code-splitting) 以获取如何设置一个 Web 应用，在支持原生 ES 模块的浏览器上使用原生 ES 模块，并在有需要时回退到 SystemJS 的示例。

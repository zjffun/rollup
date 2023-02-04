---
title: ES 模块语法
---

# {{ $frontmatter.title }}

[[toc]]

以下内容旨在对 [ES2015 规范](https://www.ecma-international.org/ecma-262/6.0/)中定义的模块行为做一个轻量级的参考，因为对导入和导出语句的正确理解对于成功使用 Rollup 是至关重要的。

## 导入

导入的值不能重新分配，尽管导入的对象和数组可以被修改（导出模块，以及任何其他的导入，都将受到该修改的影响）。在这种情况下，它们的行为与 `const` 声明类似。

### 命名导入

从源模块导入其原始名称的特定项。

```js
import { something } from './module.js';
```

从源模块导入特定项，并在导入时指定自定义名称。

```js
import { something as somethingElse } from './module.js';
```

### 命名空间导入

将源模块中的所有内容作为一个对象导入，该对象将所有源模块的命名导出公开为属性和方法。

```js
import * as module from './module.js';
```

上面的 `something` 示例将作为属性附加到导入的对象，例如 `module.something`。默认导出如果存在，则可以通过 `module.default` 访问。

### 默认导入

导入源文件的**默认导出**。

```js
import something from './module.js';
```

### 空的导入

加载模块代码，但不访问其中的对象。

```js
import './module.js';
```

这对于 polyfill 很有用，或者当导入代码的主要目的是处理原型时。

### 动态导入

使用 [动态导入 API](https://github.com/tc39/proposal-dynamic-import#import) 导入模块。

```js
import('./modules.js').then(({ default: DefaultExport, NamedExport }) => {
	// do something with modules.
});
```

这对于应用程序代码拆分和动态使用模块很有用。

## 导出

### 命名导出

导出已经声明的值：

```js
const something = true;
export { something };
```

在导出时重命名：

```js
export { something as somethingElse };
```

声明后立即导出：

```js
// this works with `var`, `let`, `const`, `class`, and `function`
export const something = true;
```

### 默认导出

导出一个值作为源模块的默认导出：

```js
export default something;
```

仅当源模块只有一个导出时，才建议使用此做法。

将默认和命名导出组合在同一模块中是不好的做法，尽管它是规范允许的。

## 绑定是如何工作的

ES 模块导出是实时绑定的，所以值可以在导入后改变，正如[这个示例](../repl/index.md?shareable=JTdCJTIyZXhhbXBsZSUyMiUzQW51bGwlMkMlMjJtb2R1bGVzJTIyJTNBJTVCJTdCJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMCU3QiUyMGNvdW50JTJDJTIwaW5jcmVtZW50JTIwJTdEJTIwZnJvbSUyMCcuJTJGaW5jcmVtZW50ZXIuanMnJTNCJTVDbiU1Q25jb25zb2xlLmxvZyhjb3VudCklM0IlMjAlMkYlMkYlMjAwJTVDbmluY3JlbWVudCgpJTNCJTVDbmNvbnNvbGUubG9nKGNvdW50KSUzQiUyMCUyRiUyRiUyMDElMjIlMkMlMjJpc0VudHJ5JTIyJTNBdHJ1ZSUyQyUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTdEJTJDJTdCJTIyY29kZSUyMiUzQSUyMmV4cG9ydCUyMGxldCUyMGNvdW50JTIwJTNEJTIwMCUzQiU1Q24lNUNuZXhwb3J0JTIwZnVuY3Rpb24lMjBpbmNyZW1lbnQoKSUyMCU3QiU1Q24lMjAlMjBjb3VudCUyMCUyQiUzRCUyMDElM0IlNUNuJTdEJTIyJTJDJTIyaXNFbnRyeSUyMiUzQWZhbHNlJTJDJTIybmFtZSUyMiUzQSUyMmluY3JlbWVudGVyLmpzJTIyJTdEJTVEJTJDJTIyb3B0aW9ucyUyMiUzQSU3QiUyMmFtZCUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyJTIyJTdEJTJDJTIyZm9ybWF0JTIyJTNBJTIyZXMlMjIlMkMlMjJnbG9iYWxzJTIyJTNBJTdCJTdEJTJDJTIybmFtZSUyMiUzQSUyMm15QnVuZGxlJTIyJTdEJTdE)：

```js
// incrementer.js
export let count = 0;

export function increment() {
	count += 1;
}
```

```js
// main.js
import { count, increment } from './incrementer.js';

console.log(count); // 0
increment();
console.log(count); // 1

count += 1; // Error — only incrementer.js can change this
```

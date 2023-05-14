define(['require', './chunk-dep2-af768b5f'], (function (require, dep2) { 'use strict';

	var num = 3;
	console.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);

	console.log(dep2.num + num);
	console.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);

}));
console.log({
  "exports": [],
  "facadeModuleId": "**/main2.js",
  "isDynamicEntry": false,
  "isEntry": true,
  "isImplicitEntry": false,
  "moduleIds": [
    "**/dep3.js",
    "**/main2.js"
  ],
  "name": "main2",
  "type": "chunk",
  "dynamicImports": [],
  "fileName": "entry-main2-d26bed01.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-af768b5f.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-af768b5f.js"
  ],
  "modules": {
    "**/dep3.js": {
      "code": "\tvar num = 3;\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 117
    },
    "**/main2.js": {
      "code": "\tconsole.log(dep2.num + num);\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 133
    }
  },
  "referencedFiles": [
    "asset-test-9f86d081"
  ]
});
console.log('all chunks', ["entry-main1-62378d9a.js","entry-main2-d26bed01.js","chunk-dep2-af768b5f.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d081');

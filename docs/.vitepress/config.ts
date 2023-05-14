import alias from '@rollup/plugin-alias';
import { defineConfig } from 'vitepress';
import { moduleAliases } from '../../build-plugins/aliases';
import replaceBrowserModules from '../../build-plugins/replace-browser-modules';
import '../declarations.d';
import { examplesPlugin } from './create-examples';
import { renderMermaidGraphsPlugin } from './mermaid';
import { transposeTables } from './transpose-tables';
import { buildEnd, callback, transformPageData } from './verify-anchors';

export default defineConfig({
	buildEnd,
	description: 'compile JS code',
	head: [
		['link', { href: '/favicon.png', rel: 'icon', type: 'image/png' }],
		['link', { href: '/favicon.png', rel: 'apple-touch-icon', sizes: '128x128' }],
		['link', { href: '/manifest.json', rel: 'manifest' }],
		['meta', { content: '#333333', name: 'theme-color' }],
		['meta', { content: 'yes', name: 'mobile-web-app-capable' }],
		['meta', { content: 'default', name: 'apple-mobile-web-app-status-bar-style' }],
		['meta', { content: 'summary_large_image', name: 'twitter:card' }],
		['meta', { content: '@rollupjs', name: 'twitter:site' }],
		['meta', { content: '@rollupjs', name: 'twitter:creator' }],
		['meta', { content: 'Rollup', name: 'twitter:title' }],
		['meta', { content: 'The JavaScript module bundler', name: 'twitter:description' }],
		['meta', { content: 'https://rollupjs.org/twitter-card.jpg', name: 'twitter:image' }]
	],
	locales: {
		root: { label: 'English' },
		zh: { label: '简体中文', link: 'https://cn.rollupjs.org' }
	},
	markdown: {
		anchor: {
			callback,
			level: 2
		},
		config(md) {
			transposeTables(md);
		},
		linkify: false,
		toc: {
			level: [2, 3, 4]
		}
	},
	themeConfig: {
		algolia: {
			apiKey: '233d24494bdf54811b5c3181883b5ee3',
			appId: 'V5XQ4IDZSG',
			indexName: 'rollupjs'
		},
		editLink: {
			pattern: 'https://github.com/rollup/rollup/edit/master/docs/:path',
			text: 'Edit this page on GitHub'
		},
		footer: {
			copyright: 'Copyright © 2015-present Rollup contributors',
			message: 'Released under the MIT License.'
		},
		logo: '/rollup-logo.svg',
		nav: [
			{ link: '/introduction/', text: '入门指导' },
			{ link: '/repl/', text: '交互式执行环境' },
			{ link: 'https://is.gd/rollup_chat', text: '讨论' },
			{ link: 'https://opencollective.com/rollup', text: 'opencollective' }
		],
		outline: 'deep',
		sidebar: [
			{
				items: [
					{
						link: '/introduction/',
						text: '入门指导'
					},
					{
						link: '/command-line-interface/',
						text: '命令行界面'
					},
					{
						link: '/javascript-api/',
						text: 'Javascript API'
					}
				],
				text: '开始'
			},
			{
				items: [
					{
						link: '/tutorial/',
						text: '教程'
					},
					{
						link: '/es-module-syntax/',
						text: 'ES 模块语法'
					},
					{
						link: '/faqs/',
						text: '常见问题'
					},
					{
						link: '/troubleshooting/',
						text: '错误排查'
					},
					{
						link: '/migration/',
						text: '迁移到 Rollup 3'
					},
					{
						link: '/tools/',
						text: '其他工具'
					}
				],
				text: '更多信息'
			},
			{
				items: [
					{
						link: '/configuration-options/',
						text: '配置选项'
					},
					{
						link: '/plugin-development/',
						text: '插件开发'
					}
				],
				text: 'API'
			}
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/rollup/rollup' },
			{ icon: 'mastodon', link: 'https://m.webtoo.ls/@rollupjs' }
		]
	},
	title: 'Rollup',
	transformPageData,
	vite: {
		plugins: [
			renderMermaidGraphsPlugin(),
			replaceBrowserModules(),
			{
				apply: 'build',
				enforce: 'pre',
				name: 'replace-local-rollup',
				resolveId(source) {
					if (source.includes('/browser-entry')) {
						return false;
					}
				}
			},
			examplesPlugin(),
			alias(moduleAliases)
		]
	}
});

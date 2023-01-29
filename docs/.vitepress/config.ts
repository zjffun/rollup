import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import '../declarations.d';
import { buildEnd, callback, transformPageData } from './verify-anchors';

export default withMermaid(
	defineConfig({
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
		markdown: {
			anchor: {
				callback,
				level: 2
			},
			linkify: false,
			toc: {
				level: [2, 3, 4]
			}
		},
		themeConfig: {
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
				{ link: '/introduction/', text: '指南' },
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
							text: 'Introduction'
						},
						{
							link: '/command-line-interface/',
							text: 'Command Line Interface'
						},
						{
							link: '/javascript-api/',
							text: 'Javascript API'
						}
					],
					text: 'Getting started'
				},
				{
					items: [
						{
							link: '/tutorial/',
							text: 'Tutorial'
						},
						{
							link: '/es-module-syntax/',
							text: 'ES Module Syntax'
						},
						{
							link: '/faqs/',
							text: 'Frequently Asked Questions'
						},
						{
							link: '/troubleshooting/',
							text: 'Troubleshooting'
						},
						{
							link: '/migration/',
							text: 'Migrating to Rollup 3'
						},
						{
							link: '/tools/',
							text: 'Other Tools'
						}
					],
					text: 'More info'
				},
				{
					items: [
						{
							link: '/configuration-options/',
							text: 'Configuration Options'
						},
						{
							link: '/plugin-development/',
							text: 'Plugin Development'
						}
					],
					text: 'API'
				}
			],
			socialLinks: [{ icon: 'github', link: 'https://github.com/rollup/rollup' }]
		},
		title: 'Rollup',
		transformPageData
	})
);

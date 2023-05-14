import { unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import * as rollup from '../../src/node-entry';
import type { MergedRollupOptions } from '../../src/rollup/types';
import { bold } from '../../src/utils/colors';
import {
	error,
	errorCannotBundleConfigAsEsm,
	errorCannotLoadConfigAsCjs,
	errorCannotLoadConfigAsEsm,
	errorMissingConfig
} from '../../src/utils/error';
import { mergeOptions } from '../../src/utils/options/mergeOptions';
import type { GenericConfigObject } from '../../src/utils/options/options';
import relativeId from '../../src/utils/relativeId';
import { stderr } from '../logging';
import batchWarnings from './batchWarnings';
import { addCommandPluginsToInputOptions, addPluginsFromCommandOption } from './commandPlugins';
import type { LoadConfigFile } from './loadConfigFileType';

export const loadConfigFile: LoadConfigFile = async (fileName, commandOptions = {}) => {
	const configs = await getConfigList(
		getDefaultFromCjs(await getConfigFileExport(fileName, commandOptions)),
		commandOptions
	);
	const warnings = batchWarnings();
	try {
		const normalizedConfigs: MergedRollupOptions[] = [];
		for (const config of configs) {
			const options = await mergeOptions(config, commandOptions, warnings.add);
			await addCommandPluginsToInputOptions(options, commandOptions);
			normalizedConfigs.push(options);
		}
		return { options: normalizedConfigs, warnings };
	} catch (error_) {
		warnings.flush();
		throw error_;
	}
};

async function getConfigFileExport(fileName: string, commandOptions: Record<string, unknown>) {
	if (commandOptions.configPlugin || commandOptions.bundleConfigAsCjs) {
		try {
			return await loadTranspiledConfigFile(fileName, commandOptions);
		} catch (error_: any) {
			if (error_.message.includes('not defined in ES module scope')) {
				return error(errorCannotBundleConfigAsEsm(error_));
			}
			throw error_;
		}
	}
	let cannotLoadEsm = false;
	const handleWarning = (warning: Error): void => {
		if (warning.message.includes('To load an ES module')) {
			cannotLoadEsm = true;
		}
	};
	process.on('warning', handleWarning);
	try {
		const fileUrl = pathToFileURL(fileName);
		if (process.env.ROLLUP_WATCH) {
			// We are adding the current date to allow reloads in watch mode
			fileUrl.search = `?${Date.now()}`;
		}
		return (await import(fileUrl.href)).default;
	} catch (error_: any) {
		if (cannotLoadEsm) {
			return error(errorCannotLoadConfigAsCjs(error_));
		}
		if (error_.message.includes('not defined in ES module scope')) {
			return error(errorCannotLoadConfigAsEsm(error_));
		}
		throw error_;
	} finally {
		process.off('warning', handleWarning);
	}
}

function getDefaultFromCjs(namespace: GenericConfigObject): unknown {
	return namespace.default || namespace;
}

async function loadTranspiledConfigFile(
	fileName: string,
	{ bundleConfigAsCjs, configPlugin, silent }: Record<string, unknown>
): Promise<unknown> {
	const warnings = batchWarnings();
	const inputOptions = {
		external: (id: string) =>
			(id[0] !== '.' && !isAbsolute(id)) || id.slice(-5, id.length) === '.json',
		input: fileName,
		onwarn: warnings.add,
		plugins: [],
		treeshake: false
	};
	await addPluginsFromCommandOption(configPlugin, inputOptions);
	const bundle = await rollup.rollup(inputOptions);
	if (!silent && warnings.count > 0) {
		stderr(bold(`loaded ${relativeId(fileName)} with warnings`));
		warnings.flush();
	}
	const {
		output: [{ code }]
	} = await bundle.generate({
		exports: 'named',
		format: bundleConfigAsCjs ? 'cjs' : 'es',
		plugins: [
			{
				name: 'transpile-import-meta',
				resolveImportMeta(property, { moduleId }) {
					if (property === 'url') {
						return `'${pathToFileURL(moduleId).href}'`;
					}
					if (property == null) {
						return `{url:'${pathToFileURL(moduleId).href}'}`;
					}
				}
			}
		]
	});
	return loadConfigFromWrittenFile(
		join(dirname(fileName), `rollup.config-${Date.now()}.${bundleConfigAsCjs ? 'cjs' : 'mjs'}`),
		code
	);
}

async function loadConfigFromWrittenFile(
	bundledFileName: string,
	bundledCode: string
): Promise<unknown> {
	await writeFile(bundledFileName, bundledCode);
	try {
		return (await import(pathToFileURL(bundledFileName).href)).default;
	} finally {
		// Not awaiting here saves some ms while potentially hiding a non-critical error
		unlink(bundledFileName);
	}
}

async function getConfigList(configFileExport: any, commandOptions: any): Promise<any[]> {
	const config = await (typeof configFileExport === 'function'
		? configFileExport(commandOptions)
		: configFileExport);
	if (Object.keys(config).length === 0) {
		return error(errorMissingConfig());
	}
	return Array.isArray(config) ? config : [config];
}

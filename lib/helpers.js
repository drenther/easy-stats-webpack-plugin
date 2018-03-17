const chalk = require('chalk');
const { pick, omit } = require('lodash');

const warn = msg => console.log(chalk.yellow(msg));
const err = msg => console.log(chalk.red(msg));
const shout = msg => console.log(chalk.bgGreen.blue(msg));

const VALID_STATS_PRESETS = ['errors-only', 'minimal', 'none', 'normal', 'verbose'];
const VALID_STATS_PROPS = [
	'all',
	'assets',
	'assetsSort',
	'cached',
	'cachedAssets',
	'children',
	'chunks',
	'chunkModules',
	'chunkOrigins',
	'chunksSort',
	'context',
	'colors',
	'depth',
	'entrypoints',
	'env',
	'errors',
	'errorDetails',
	'excludeAssets',
	'excludeModules',
	'exclude',
	'hash',
	'maxModules',
	'modules',
	'modulesSort',
	'moduleTrace',
	'performance',
	'providedExports',
	'publicPath',
	'reasons',
	'source',
	'timings',
	'usedExports',
	'version',
	'warnings',
	'warningsFilter',
];

const VALID_FILTER_PROPS = {
	assets: ['chunkNames', 'chunks', 'emitted', 'name', 'size'],
	chunks: [
		'entry',
		'files',
		'filteredModules',
		'id',
		'initial',
		'modules',
		'names',
		'origins',
		'parents',
		'rendered',
		'size',
	],
	origins: ['loc', 'module', 'moduleId', 'moduleIdentifier', 'moduleName', 'name', 'reasons'],
	reasons: ['loc', 'module', 'moduleId', 'moduleIdentifier', 'moduleName', 'type', 'userRequest'],
	modules: [
		'assets',
		'built',
		'cacheable',
		'chunks',
		'errors',
		'failed',
		'id',
		'identifier',
		'name',
		'optional',
		'prefetched',
		'profile',
		'reasons',
		'size',
		'source',
		'warnings',
	],
};

const VALID_CUSTOM_PROPS = {
	buildTime: function({ endTime, startTime }) {
		return `${endTime - startTime}ms`;
	},
};

function statsOptionsMiddleware(statsOptions) {
	const defaultStatsOptions = { all: undefined };
	if (typeof statsOptions === 'string') {
		if (!VALID_STATS_PRESETS.includes(statsOptions)) {
			err(`Invalid stats preset - ${statsOptions}.`);
			warn('Refer to - https://webpack.js.org/configuration/stats/ for help');
			return defaultStatsOptions;
		} else {
			return statsOptions;
		}
	} else if (typeof statsOptions === 'object') {
		const wrongProps = Object.keys(statsOptions).filter(key => !VALID_STATS_PROPS.includes(key));

		if (wrongProps.length > 0) {
			err(`These options are not available : ${wrongProps.join(' ')}`);
			warn('Refer to - https://webpack.js.org/configuration/stats/ for help');
			return defaultStatsOptions;
		}

		return omit(statsOptions, wrongProps);
	}
	return 'normal';
}

function customOptionsMiddleware(customOptions) {
	if (customOptions.constructor === Array) {
		const validProps = customOptions.filter(key => Object.keys(VALID_CUSTOM_PROPS).includes(key));
		if (validProps.length === 0) return undefined;
		if (validProps.length !== customOptions.length) {
			err('Invalid custom properties passed.');
			warn('Refer to - https://github.com/drenther/easy-stats-webpack-plugin#customoptions');
		}
		return pick(VALID_CUSTOM_PROPS, validProps);
	} else {
		err('Custom Properties must be an array containing values to be generated.');
		warn('Refer to - https://github.com/drenther/easy-stats-webpack-plugin#customoptions');
		return undefined;
	}
}

function filterStatsMiddleware(stats, filterOptions) {
	const filterOptionsKeys = Object.keys(filterOptions);
	const validFilterOptionsKeys = Object.keys(VALID_FILTER_PROPS);
	const invalidFilterOptions = filterOptionsKeys.filter(key => !validFilterOptionsKeys.includes(key));
	if (invalidFilterOptions.length > 0) {
		err(`These Filter Options passed to the plugin are invalid : ${invalidFilterOptions.join(' ')}`);
		warn('Refer to - https://github.com/drenther/easy-stats-webpack-plugin#filteroptions');
		return stats;
	}
	validFilterOptionsKeys.forEach(key => {
		if (
			filterOptionsKeys.includes(key) &&
			!filterOptions[key].filter(k => VALID_FILTER_PROPS[key].includes(k)).length
		) {
			err(`${key} Fields in the Filter Options passed to the plugin are invalid`);
			warn('Refer to - https://github.com/drenther/easy-stats-webpack-plugin#filteroptions');
		}
	});
	const filteredStats = startRecursiveFilteringFromRoot(stats, filterOptions);
	return filteredStats;
}

function startRecursiveFilteringFromRoot(stats, options) {
	const filteredStats = Object.assign({}, stats);
	const filteredAssets = filteredStats['assets'];
	if (filteredAssets) {
		filteredStats['assets'] = filterAssetsFields(filteredAssets, options);
	}
	const filteredChunks = filteredStats['chunks'];
	if (filteredChunks) {
		filteredStats['chunks'] = filterChunksFields(filteredChunks, options);
	}
	const filteredModules = filteredStats['modules'];
	if (filteredModules) {
		filteredStats['modules'] = filterModulesFields(filteredModules, options);
	}
	return filteredStats;
}

function filterAssetsFields(assets, options) {
	return assets.map(asset => omit(asset, options['assets']));
}

function filterChunksFields(chunks, options) {
	return chunks.map(chunk => {
		const filteredChunk = omit(chunk, options['chunks']);
		let filteredChunkModules = filteredChunk['modules'];
		if (filteredChunkModules) {
			filteredChunk['modules'] = filterModulesFields(filteredChunkModules, options);
		}
		let filteredChunkOrigins = filteredChunk['origins'];
		if (filteredChunkOrigins) {
			filteredChunk['origins'] = filterOriginsFields(filteredChunkOrigins, options);
		}
		return filteredChunk;
	});
}

function filterModulesFields(modules, options) {
	return modules.map(mod => {
		const filteredModule = omit(mod, options['modules']);
		let filteredModuleAssets = filteredModule['assets'];
		if (filteredModuleAssets) {
			filteredModule['assets'] = filterAssetsFields(filteredModuleAssets, options);
		}
		let filteredModuleReasons = filteredModule['reasons'];
		if (filteredModuleReasons) {
			filteredModule['reasons'] = filterReasonsFields(filteredModuleReasons, options);
		}
		return filteredModule;
	});
}

function filterOriginsFields(origins, options) {
	return origins.map(origin => {
		const filteredOrigin = omit(origin, options['origins']);
		let filteredOriginReasons = filteredOrigin['reasons'];
		if (filteredOriginReasons) {
			filteredOrigin['reasons'] = filterReasonsFields(filteredOriginReasons, options);
		}
		return filteredOrigin;
	});
}

function filterReasonsFields(reasons, options) {
	return reasons.map(reason => omit(reason, options['reasons']));
}

module.exports = {
	statsOptionsMiddleware,
	customOptionsMiddleware,
	filterStatsMiddleware,
	shout,
	err,
	warn,
};

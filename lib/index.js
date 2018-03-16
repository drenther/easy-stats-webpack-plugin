const fs = require('fs');

const { statsOptionsMiddleware, customOptionsMiddleware, filterStatsMiddleware, err, shout } = require('./helpers');

const PLUGIN_NAME = 'EasyStatsWebpackPlugin';
const INDENT = 2;

module.exports = class EasyStatsWebpackPlugin {
	constructor({
		emittedStatsFilename = 'stats.json',
		customStatsFilename = 'custom-stats.json',
		statsOptions = {},
		filterOptions = [],
		customOptions = [],
		transform = data => JSON.stringify(data, null, INDENT),
	}) {
		this.emittedStatsFilename = emittedStatsFilename;
		this.customStatsFilename = customStatsFilename;
		this.statsOptions = statsOptions;
		this.filterOptions = filterOptions;
		this.customOptions = customOptions;
		this.transform = transform;
	}

	apply(compiler) {
		if (compiler.hooks) {
			compiler.hooks.emit.tapAsync(PLUGIN_NAME, this.emitStats.bind(this));
			compiler.hooks.done.tap(PLUGIN_NAME, this.customStats.bind(this));
		} else {
			compiler.plugin('emit', this.emitStats.bind(this));
			compiler.plugin('done', this.customStats.bind(this));
		}
	}

	emitStats(compilation, callback) {
		const emittedStats = compilation.getStats().toJson(statsOptionsMiddleware(this.statsOptions));
		const filteredStats = filterStatsMiddleware(emittedStats, this.filterOptions);
		const statsOutput = this.transform(filteredStats);
		compilation.assets[this.emittedStatsFilename] = {
			source() {
				return statsOutput;
			},
			size() {
				return statsOutput.length;
			},
		};
		if (callback) callback();
	}

	customStats(stats) {
		const customStatsResolvers = customOptionsMiddleware(this.customOptions);
		if (customStatsResolvers) {
			const customStats = Object.keys(customStatsResolvers).reduce((res, key) => {
				res[key] = customStatsResolvers[key](stats);
				return res;
			}, {});
			const output = this.transform(customStats);
			fs.writeFile(this.customStatsFilename, output, error => {
				if (error) err('Custom Stats could not be generated. Probably some issue with the "fs" node module.');
				shout(`Customs Stats generated and saved to ${this.customStatsFilename}`);
			});
		}
	}
};

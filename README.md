# easy-stats-webpack-plugin

Webpack stats plugin with granular control, filtering, transform function and custom stats.

It allows you to generate stats based on presets like 'errors-only', 'minimal', 'verbose', etc or using options object for more granular control.

It further allows you to filter out properties from chunks, assets, modules, origins and reasons object anywhere on the stats object tree. It helps you focus on the stats you need, making the stats output itself more human readable.

Refer to [API](https://github.com/drenther/easy-stats-webpack-plugin#api) and [Usage/Examples](https://github.com/drenther/easy-stats-webpack-plugin#usage) for better understanding.

#### Note - This plugin was initially made in order to learn and understand webpack better. Use with caution, it is not the most stable stats plugin. Please post [issues](https://github.com/drenther/easy-stats-webpack-plugin/issues) for anything that doesn't work or can be improved

## Installation

```javascript
$ npm i -D easy-stats-webpack-plugin
```

or

```javascript
$ yarn add --dev easy-stats-webpack-plugin
```

## API

The plugin accepts a single object as an argument. The argument object accepts the following properties :

#### emittedStatsfilename

**Default: 'stats.json'**
This parameter sets the filename for the file that will emit the webpack stats object.

#### statsOptions

**Default: { all: none }**
This parameter is passed to .toJson() method on stats object. For the accepted structure refer to [webpack documentation](https://webpack.js.org/configuration/stats/#stats)

#### filterOptions

**Default: {}** (No filtering)
This parameter is passed to further control or filter out certain properties from the generated stats object.
Accepted Structure:

```javascript
{
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
	origins: [
		'loc',
		'module',
		'moduleId',
		'moduleIdentifier',
		'moduleName',
		'name',
		'reasons',
	],
	reasons: [
		'loc',
		'module',
		'moduleId',
		'moduleIdentifier',
		'moduleName',
		'type',
		'userRequest',
	],
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
```

For better understanding how the structure relate to the emitted stats object refer to [webpack documentation](https://webpack.js.org/api/stats/#structure)

### customStatsFilename

**Default: custom-stats.json** (generates only if customOptions are passed)
For better separation of webpack generated stats and custom generated stats. It generates two separate filenames. This parameter determines the name of the custom stats file.

### customOptions

**Default: []**
This parameter is used to generate respective custom stats.

###### This is an experimental feature. It only includes **buildTime** as valid parameter at the moment. In the future, it will accept functions to generate user defined custom stats.

### transform

**Default: data => JSON.stringify(data, null, 2)**

This allows for custom formatting of the output.
This parameter is a function that accepts a stats data as "data" parameter. The function must return string or stringified JSON or markdown or anything depending on the output file you want. For example, it should return stringified JSON if the output files are .json.

## Usage

### Basic Example

An example showing the most basic usage with all default values.
This config will generate stats.json file with "Standard Output"

```javascript
const EasyStatsWebpackPlugin = require('EasyStatsWebpackPlugin');

module.exports = {
	plugins: [
		// put it as the last plugin
		new EasyStatsWebpackPlugin(),
	],
};
```

### Example with Stats Presets and Stats Filename

An example showing how to pass preset settings to getStats.toJson() and selecting the filename for the stats file.
This will write the emittedStats to a file named 'emitted-stats.json' in the output path of the webpack config and the stats object will only output when errors happen.

```javascript
const EasyStatsWebpackPlugin = require('EasyStatsWebpackPlugin');

module.exports = {
	plugins: [
		new EasyStatsWebpackPlugin({
			emittedStatsFilename: 'emitted-stats.json',
			statsOptions: 'errors-only',
		}),
	],
};
```

### Example with Granular Settings for Stats

An example showing how to get granular control of what stats are emitted.
This will show maximum 3 modules stats in the stats object.

```javascript
const EasyStatsWebpackPlugin = require('EasyStatsWebpackPlugin');

module.exports = {
	plugins: [
		new EasyStatsWebpackPlugin({
			statsOptions: { maxModules: 3 },
		}),
	],
};
```

### Example with Filtering attributes from the generated Stats

An example showing how you can filter attributes from nested structures like assets, chunks, modules, origins and reasons.
This example removes 'userRequest' field from all the reason objects from the stats object, 'loc' field from all the origin objects and 'modules' field from all the chunk objects.

```javascript
const EasyStatsWebpackPlugin = require('EasyStatsWebpackPlugin');

module.exports = {
	plugins: [
		new EasyStatsWebpackPlugin({
			filterOptions: {
				reasons: ['userRequest'],
				chunks: ['modules'],
				origins: ['loc'],
			},
		}),
	],
};
```

### Example with Custom Stats and User Defined filename for storing the Custom Stats

###### This is an experimental feature. It only includes **buildTime** as valid parameter at the moment. In the future, it will accept functions to generate user defined custom stats.

This example outputs buildTime to 'build-time.json' in the root directory of the project.

```javascript
const EasyStatsWebpackPlugin = require('EasyStatsWebpackPlugin');

module.exports = {
	plugins: [
		new EasyStatsWebpackPlugin({
			customOptions: ['buildTime'],
			customStatsFilename: 'build-time.json',
		}),
	],
};
```

### Example using a Transform Function

This example shows the use of a transform function that overrides the default formatting of the stats output.

```javascript
const EasyStatsWebpackPlugin = require('EasyStatsWebpackPlugin');

module.exports = {
	plugins: [
		new EasyStatsWebpackPlugin({
			transform(data) {
				return JSON.stringify(
					{
						webpackVersion: data.version,
						assetsEmitted: data.assetsByChunkName,
					},
					null,
					2
				);
			},
		}),
	],
};
```

## Improvements Needed

* Making Custom Stats usable
* Writing Tests
* Better error reporting
* Organising the code

## Inspired by these commonly used webpack plugins

* [webpack-stats-plugin](https://github.com/FormidableLabs/webpack-stats-plugin)
* [stats-webpack-plugin](https://github.com/unindented/stats-webpack-plugin)

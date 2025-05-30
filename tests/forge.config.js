const { default: WebpackPlugin } = require('@electron-forge/plugin-webpack');
const { ForgeExternalsPlugin } = require('..');

module.exports = {
	packagerConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				name: 'test_app',
			},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
	],
	plugins: [
		new WebpackPlugin({
			mainConfig: './webpack.main.config.js',
			renderer: {
				config: './webpack.renderer.config.js',
				entryPoints: [
					{
						html: './src/index.html',
						js: './src/renderer.ts',
						name: 'main_window',
					},
				],
			},
		}),
		new ForgeExternalsPlugin({
			externals: ['native-hello-world'],
		}),
	],
};

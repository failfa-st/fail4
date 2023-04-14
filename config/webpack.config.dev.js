const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	devtool: false,
	entry: "./project/src/index.js",
	output: {
		path: path.resolve("./dist"),
		filename: "bundle.js",
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./project/public/index.html",
			inject: "body",
			publicPath: "./",
		}),
	],
	experiments: {
		topLevelAwait: true,
	},
	mode: "development",
	devServer: {
		hot: true,
		port: 8080,
		open: false,
		allowedHosts: ["all"],
		static: {
			directory: "./project/public",
		},
	},
};

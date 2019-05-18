const path = require("path");

module.exports = {
    entry: './index.ts',
    output: {
      path: path.resolve(__dirname, "build"),
      publicPath: "/assets/",
      filename: "bundle.js"
    },
    resolve: {
        extensions: [".ts",".js"]
    },
    devtool: "source-map",
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    mode: "development"
};
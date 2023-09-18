const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "index.js",
    library: "@mitz-it/websocket-client",
    sourceMapFilename: "index.d.ts",
    libraryTarget: "umd",
    umdNamedDefine: true,
    globalObject: "this",
  },
};

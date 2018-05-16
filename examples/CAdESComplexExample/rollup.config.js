import rollupNodeResolve from "rollup-plugin-node-resolve";

export default {
	input: "es6.js",
	plugins: [
		rollupNodeResolve({ jsnext: true, main: true })
	],
	output: [
		{
			file: "bundle.js",
			format: "iife",
			outro: `
window.makeCAdESAv3 = makeCAdESAv3;
window.makeCAdESXL = makeCAdESXL;
window.handleParsingFile = handleParsingFile;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/cadesComplexExample.js",
			format: "es"
		}
	]
};
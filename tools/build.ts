import { build } from "esbuild";
import fs from "node:fs";
import ts from "typescript";
import { collectExportedFunctionNames } from "./exportHandlers.ts";

const ENTRY_POINT = "src/main.ts";
const globalName = "_entry";

if (!fs.existsSync(ENTRY_POINT)) {
	console.error(`Error: Entry point file not found: ${ENTRY_POINT}`);
	process.exit(1);
}

const program = ts.createProgram([ENTRY_POINT], {});
const sourceFile = program.getSourceFile(ENTRY_POINT);

const exportedFunctionNames = sourceFile
	? collectExportedFunctionNames(sourceFile)
	: [];

console.log("Exported function names:", exportedFunctionNames);
console.log("Building with esbuild...");

build({
	entryPoints: [ENTRY_POINT],
	format: "iife",
	bundle: true,
	outdir: "dist",
	target: "es2020",
	globalName,
	banner: {
		js: `
${exportedFunctionNames
	.map((functionName) =>
		`
function ${functionName} () {
  return ${globalName}.${functionName}(...arguments);
};
`.trim(),
	)
	.join("\n")}
`.trim(),
	},
}).catch((error) => {
	console.error("Build failed:", error);
	process.exit(1);
});

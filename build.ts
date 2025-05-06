import { spawn } from "child_process";
import { build } from "esbuild";
import { existsSync } from "fs";
import { copyFile, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { inject } from "postject";

(async () => {
	const outDir = 'dist';

	console.log('Cleaning dist dir');
	await rm(outDir, { recursive: true, force: true });

	const outScript = join(outDir, 'script.js');
	const outSeaConfig = join(outDir, 'sea.json');
	const outSeaBlob = join(outDir, 'sea.blob');
	const outExe = join(outDir, 'slc_wrapper.exe');

	console.log('Build script');
	const builded = await build({
		entryPoints: ['src/index.ts'],
		outfile: outScript,
		platform: 'node',
		bundle: true
	});

	if (builded.warnings.length)
		builded.warnings.forEach(warn => console.warn(warn));

	if (builded.errors.length)
		return builded.errors.forEach(error => console.error(error));

	if (!existsSync(outSeaConfig)) {
		console.log("Create SEA-config");
		writeFile(outSeaConfig,
			JSON.stringify({
				main: outScript,
				disableExperimentalSEAWarning: true,
				output: outSeaBlob
			})
		);
	}

	console.log("Copy NodeJS");
	const creatingBlob = spawn('node', ['--experimental-sea-config', outSeaConfig]);
	if (!await new Promise<boolean>((r) => creatingBlob.on('exit', code => r(code == 0)))) return;

	await copyFile(process.execPath, outExe);

	//signtool remove /s outExe 

	console.log("Inject script");
	await inject(
		outExe,
		'NODE_SEA_BLOB', await readFile(outSeaBlob),
		{
			sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'
		}
	);


	//signtool sign /fd SHA256 outExe 

})();

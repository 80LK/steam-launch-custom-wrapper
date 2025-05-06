import { spawn } from "child_process";
import { dirname, resolve } from "path";

function main() {
	if (process.argv.length == 2) {
		console.log(`Usage: slc_wrapper.exe <executable> [--wd=<workdir>] [options]`);
		return;
	}

	const CWD = process.cwd();
	const executable = resolve(CWD, process.argv[2]);
	const cwd = resolve(CWD, process.argv.find(value => value.startsWith('--wd='))?.slice(5) ?? dirname(executable));
	const args = process.argv.slice(3).filter(v => !v.startsWith('--wd='));

	console.log(`Run ${executable} in directory ${cwd} with arguments`, args);
	spawn(executable, args, { cwd })
}


main();

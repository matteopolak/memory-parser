import fs from 'fs';
import { parseMemoryDump, iterateFiles } from './utils.js';

const folder = process.argv[2];

if (folder === undefined) {
	const { flags, files } = await parseMemoryDump(fs.readFileSync(process.stdin.fd, 'utf8'));

	process.stdout.write(JSON.stringify(Object.fromEntries(flags.entries()), null, 2));
	process.stderr.write(JSON.stringify(Object.fromEntries(files.entries()), null, 2));

	process.exit(0);
}

const files = iterateFiles(folder);
const out = `${folder}_out`;

await fs.promises.mkdir(out)
	.catch(() => {});

let i = 0;

const top = {
	files: -1,
	files_count: -1,
	flags: -1,
	flags_count: -1
};

for await (const data of files) {
	const { flags, files } = await parseMemoryDump(data);

	await Promise.all([
		fs.promises.writeFile(`${out}/flags_${++i}`, JSON.stringify(Object.fromEntries(flags.entries()))),
		fs.promises.writeFile(`${out}/files_${i}`, JSON.stringify(Object.fromEntries(files.entries())))
	]);

	if (flags.size > top.flags) {
		top.flags = i;
		top.flags_count = flags.size;
	}

	if (files.size > top.files) {
		top.files = i;
		top.files_count = files.size;
	}

	process.stdout.write(`  Done #${i}\r`);
}

console.log(`
Most files: ${out}/files_${top.files}
Most flags: ${out}/flags_${top.flags}
`);
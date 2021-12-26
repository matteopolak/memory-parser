import fs from 'fs';
import { parseMemoryDump, iterateFiles } from './utils.js';

// The name of the folder, if present
const folder = process.argv[2];

// If no folder name was provided
if (folder === undefined) {
	// Read file content from stdin and parse it
	const { flags, files } = await parseMemoryDump(fs.readFileSync(process.stdin.fd, 'utf8'));

	// Write map from flags to stdout
	process.stdout.write(JSON.stringify(Object.fromEntries(flags.entries()), null, 2));

	// Write map from files to stderr
	process.stderr.write(JSON.stringify(Object.fromEntries(files.entries()), null, 2));

	// Exit the process with code 0 (no error)
	process.exit(0);
}

// Create an iterator to iterate all file content in the folder
const files = iterateFiles(folder);

// Provide the output folder
const out = `${folder}_out`;

// Make the output folder if it doesn't exist
await fs.promises.mkdir(out)
	.catch(() => {});

// Initilaize a counter
let i = 0;

// Used as metrics at the end of the run
const top = {
	files: -1,
	files_count: -1,
	flags: -1,
	flags_count: -1
};

// Iterate all files with a `for await` loop
for await (const data of files) {
	// Parse the file
	const { flags, files } = await parseMemoryDump(data);

	// Write the content to files in the output folder
	await Promise.all([
		fs.promises.writeFile(`${out}/flags_${++i}`, JSON.stringify(Object.fromEntries(flags.entries()))),
		fs.promises.writeFile(`${out}/files_${i}`, JSON.stringify(Object.fromEntries(files.entries())))
	]);

	// Update metrics if it applies
	if (flags.size > top.flags) {
		top.flags = i;
		top.flags_count = flags.size;
	}

	if (files.size > top.files) {
		top.files = i;
		top.files_count = files.size;
	}

	// Print a status message
	// TODO: make it look nicer
	process.stdout.write(`  Done #${i}\r`);
}

// Print out the metrics
// TODO: make it look nicer
console.log(`
Most files: ${out}/files_${top.files}
Most flags: ${out}/flags_${top.flags}
`);
import fs from 'fs';
import { WINDOWS_REGEX, LINUX_REGEX, CATEGORIES } from './constants.js';

import type { Category, Flag, FlagEntry, File, FileEntry, Info } from './typings.js';

// Parse a memory dump
export async function parseMemoryDump(data: string) {
	// If it includes `HKEY_`, it's from a Windows dump
	const isWindows = data.includes('HKEY_');
	const regex = isWindows ? WINDOWS_REGEX : LINUX_REGEX;
	const matches = data.matchAll(regex);

	// Object used to store current dump information
	const info: Info = {
		category: null,
		flag: null,
		should_be_present: null,
		file: null
	};

	// By-flag map
	const flags = new Map<Flag, FlagEntry>([
		[null, {
			files: [],
			matchers: [],
			category: null
		}]
	]);

	// By-file map
	const files = new Map<File, FileEntry>([
		[null, {
			matchers: [],
			category: null,
			flag: null
		}]
	]);

	// Iterate through matches
	for (const match of matches) {
		// Get the populated index
		const index = match.findIndex((m, i) => i > 0 && m);
		
		// Get the content at the populated index
		const text = match[index] ?? '';

		switch (index) {
			// Regular expression type
			case 1:
				const data = { regex: match[1]!, is_required: info.should_be_present };

				flags.get(info.flag).matchers.push(data);
				files.get(info.file).matchers.push(data);

				break;
			// File type
			case 2:
				if ((isWindows && text.includes('boost')) || text.startsWith('/opt/CyberPatriot'))
					continue;

				info.file = text;

				flags.get(info.flag).files.push(info.file);

				if (!files.has(info.file)) {
					files.set(info.file, {
						matchers: [],
						category: info.category,
						flag: info.flag
					});
				}

				break;
			// Category type
			case 3:
				const isFlag = CATEGORIES.has(text as Category);

				info[isFlag ? 'flag' : 'category'] = text as Category;

				if (isFlag && !flags.has(text)) {
					flags.set(text, {
						files: [],
						matchers: [],
						category: info.category
					});
				}

				break;
			// XML whitelist key
			case 4:
				info.should_be_present = true;
			// XML blacklist key
			case 5:
				info.should_be_present = false;
			default:
				continue;
		}
	}

	// Return flag and file maps
	return {
		flags, files
	};
}

// Iterate all files in the folder, returning their contents
export async function* iterateFiles(folder: string) {
	const files = await fs.promises.readdir(folder);

	for (const file of files) {
		yield await fs.promises.readFile(`${folder}/${file}`, 'utf8');
	}
}
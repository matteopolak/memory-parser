import fs from 'fs';
import { WINDOWS_REGEX, LINUX_REGEX, CATEGORIES } from './constants.js';

import type { Category, Flag, FlagEntry, File, FileEntry, Info } from './typings.js';

export async function parseMemoryDump(data: string) {
	const isWindows = data.includes('HKEY_');
	const regex = isWindows ? WINDOWS_REGEX : LINUX_REGEX;
	const matches = data.matchAll(regex);

	const info: Info = {
		category: null,
		flag: null,
		should_be_present: null,
		file: null
	};

	const flags = new Map<Flag, FlagEntry>([
		[null, {
			files: [],
			matchers: [],
			category: null
		}]
	]);

	const files = new Map<File, FileEntry>([
		[null, {
			matchers: [],
			category: null,
			flag: null
		}]
	]);

	for (const match of matches) {
		const index = match.findIndex((m, i) => i > 0 && m);
		const text = match[index] ?? '';

		switch (index) {
			case 1:
				const data = { regex: match[1]!, is_required: info.should_be_present };

				flags.get(info.flag).matchers.push(data);
				files.get(info.file).matchers.push(data);

				break;
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
			case 4:
				info.should_be_present = true;
			case 5:
				info.should_be_present = false;
			default:
				continue;
		}
	}

	return {
		flags, files
	};
}

export async function* iterateFiles(folder: string) {
	const files = await fs.promises.readdir(folder);

	for (const file of files) {
		yield await fs.promises.readFile(`${folder}/${file}`, 'utf8');
	}
}
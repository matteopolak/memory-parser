import type { Category } from './typings';

// Regular expressions for parsing the memory dump
export const WINDOWS_REGEX = /(SELECT \*[^\0]+|\\Registry\\[^\0]+)|(?<=\0)(C:\\[-\w\/\\\.\s\(\)]{3,})(?=\0)|(?<=\0\0\0)([A-Z_]{2,})(?=\0\0\0)|(cff9)|(a238)/g;
export const LINUX_REGEX = /((?:\(\?i\))?\^[ -~]{3,})(?:\0|<|\\s\*)|\0(\/[-\w\/\.\s]{3,})\0|\0\0\0([A-Z_]{2,})\0\0\0|(cff9)|(a238)/g;

// List of all category names (not flag names)
export const CATEGORIES = new Set<Category>([
	'FOR', 'USR', 'ACT', 'POL', 'DEF',
	'SRV', 'OUP', 'AUP', 'FIL', 'SFT',
	'APP', 'PEN', 'SCR', 'SYS', 'MAL'
]);
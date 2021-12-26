// All built-in category possibilities
export type Category = 'FOR' | 'USR' | 'ACT' | 'POL' | 'DEF' | 'SRV' | 'OUP' | 'AUP' | 'FIL' | 'SFT' | 'APP' | 'PEN' | 'SCR' | 'SYS' | 'MAL';

// Aliases for `string`, used for easy refactoring if the type changes
export type File = string;
export type Flag = string;
export type Expression = string;

// Entry for a regular expression
export interface Matcher {
	regex: Expression,
	is_required: boolean
};

// Interface for important information used during parsing
export interface Info {
	category: Category,
	flag: Flag,
	should_be_present: boolean,
	file: File
};

// Interface for an entry in the map where the file is used as the key
export interface FileEntry {
	matchers: Matcher[],
	category: Category,
	flag: Flag
};

// Interface for an entry in the map where the flag is used as the key
export interface FlagEntry {
	matchers: Matcher[],
	files: File[],
	category: Category
};
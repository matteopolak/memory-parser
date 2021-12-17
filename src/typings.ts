export type Category = 'FOR' | 'USR' | 'ACT' | 'POL' | 'DEF' | 'SRV' | 'OUP' | 'AUP' | 'FIL' | 'SFT' | 'APP' | 'PEN' | 'SCR' | 'SYS' | 'MAL';
export type File = string;
export type Flag = string;
export type Expression = string;

export interface Matcher {
	regex: Expression,
	is_required: boolean
};

export interface Info {
	category: Category,
	flag: Flag,
	should_be_present: boolean,
	file: File
};

export interface FileEntry {
	matchers: Matcher[],
	category: Category,
	flag: Flag
};

export interface FlagEntry {
	matchers: Matcher[],
	files: File[],
	category: Category
};
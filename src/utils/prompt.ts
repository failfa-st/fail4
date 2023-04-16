export function miniPrompt(strings: TemplateStringsArray, ...args: unknown[]) {
	return strings
		.flatMap((string, index) => [string, args[index] ?? ""])
		.join("")
		.replace(/^\s+/gm, "")
		.replace(/^\n+/g, "\n")
		.trim();
}

export function extractCode(string: string) {
	const codeBlockPattern = /(`{3,})(\w*)\n([\s\S]*?)\1/g;
	const matches = codeBlockPattern.exec(string);
	if (matches && matches.length >= 4) {
		return matches[3];
	}
	return string;
}

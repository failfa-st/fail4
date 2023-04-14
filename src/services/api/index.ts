import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { nanoid } from "nanoid";
import process from "node:process";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export function miniPrompt(strings: TemplateStringsArray, ...args: unknown[]) {
	return strings
		.flatMap((string, index) => [string, args[index] ?? ""])
		.join("")
		.replace(/^\s+/gm, "")
		.replace(/^\n+/g, "\n")
		.trim();
}

function extractCode(string: string) {
	const codeBlockPattern = /(`{3,})(\w*)\n([\s\S]*?)\1/g;
	const matches = codeBlockPattern.exec(string);
	if (matches && matches.length >= 4) {
		return matches[3];
	}
	return string;
}

export async function toOpenAI({
	prompt = "be creative",
	negativePrompt = "",
	template = "",
	temperature = "0.2",
}) {
	const negativePrompt_ = negativePrompt.trim();
	const prompt_ = prompt.trim();

	const nextMessage: ChatCompletionRequestMessage = {
		role: "user",
		content: miniPrompt`
			ADD: ${prompt_}
			${negativePrompt_ ? `REMOVE: ${negativePrompt_}` : ""}
			INPUT: ${template.trim()}
			OUTPUT FORMAT: plain valid JavaScript
		`,
	};
	const task = `${prompt_}${negativePrompt_ ? ` | not(${negativePrompt_})` : ""}`;

	try {
		const response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			temperature: Number.parseFloat(temperature),
			messages: [
				{
					role: "system",
					content: miniPrompt`
All UPPERCASE words are IMPORTANT, all "UPPERCASE" words in QUOTES (") indicate KEYWORDS.
You are: expert JavaScript Developer, creative, Canvas-2d expert, performance guru, interaction expert.
You strictly follow all "DOCS".
You extend "CHANGELOG" and the CODE.
You ALWAYS follow the "ADD", "REMOVE", "INPUT" and "OUTPUT FORMAT".
You NEVER explain anything.

DOCS:
"ADD" is a set of features that You write code for
"REMOVE" is a set of things that should be removed or changed to something else
"INPUT" is the code that should be EXTENDED, ADJUSTED or FIXED
"OUTPUT FORMAT" is always JavaScript. the output should always be just JavaScript and NOTHING ELSE

You EXCLUSIVELY answer in the requested "OUTPUT FORMAT" and NOTHING ELSE
`,
				},
				nextMessage,
			],
			max_tokens: 2048,
		});

		const { message } = response.data.choices[0];

		if (message) {
			const extracted = extractCode(message.content);
			const cleanContent = extracted ?? message.content;
			return { ...message, content: cleanContent, task, id: nanoid() };
		}

		// Something broke
		// ToDo: fix it :)
		return {
			content: "/* BROKEN */",
			task,
			id: nanoid(),
		};
	} catch (error) {
		throw error;
	}
}

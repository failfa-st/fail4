import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { nanoid } from "nanoid";

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
	prompt = "",
	negativePrompt = "",
	template = "",
}: Record<string, string>) {
	const negativePrompt_ = negativePrompt.trim();
	const prompt_ = prompt.trim();

	const nextMessage: ChatCompletionRequestMessage = {
		role: "user",
		content: miniPrompt`
			DO: ${prompt_}
			${negativePrompt_ ? `DONT: ${negativePrompt_}` : ""}
			INPUT: ${template.trim()}
			OUTPUT FORMAT: plain valid JavaScript
		`,
	};
	const task = `${prompt_}${negativePrompt_ ? ` | not(${negativePrompt_})` : ""}`;
	console.log(">>> NEXT MESSAGE CONTENT");
	console.log(nextMessage.content);
	console.log("<<<");

	try {
		const response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			temperature: 0.2,
			messages: [
				{
					role: "system",
					content: `You are a FULLSTACK DEVELOPER. You implement the "DO". You NEVER implement "DONT". You EXCLUSIVELY answer in the requested "OUTPUT FORMAT" and NOTHING ELSE. You ALWAYS follow the "DO", "DONT", "INPUT" and "OUTPUT FORMAT".`,
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

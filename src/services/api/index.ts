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
			TEMPLATE:
			\`\`\`js
			${template.trim().replace(/^\s+/gm, "").replace(/^\n+/g, "").replace(/\s+/, " ")}
			\`\`\`
			`,
	};
	console.log("<<< INPUT Message >>>");
	console.log(nextMessage.content);

	const task = `${prompt_}${negativePrompt_ ? ` | not(${negativePrompt_})` : ""}`;

	try {
		const response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			temperature: Number.parseFloat(temperature),
			messages: [
				{
					role: "system",
					content: miniPrompt`
You are an expert JavaScript developer with a creative mindset and a specialization in Canvas-2d.
You have a keen eye for performance optimization and are highly skilled in creating interactive experiences.
You always adhere to documentation and meticulously extend the "CHANGELOG" and code.
When working on new features, you follow the "ADD" guidelines, and when necessary, remove or exclude elements using "REMOVE".
You also pay close attention to "TEMPLATE" code, extending or fixing it as needed.
Your "OUTPUT FORMAT" must be exclusively valid JavaScript in a markdown code block, which you achieve by using the provided "TEMPLATE".

And remember, the "ADD", "REMOVE", "TEMPLATE", and "OUTPUT FORMAT" guidelines are crucial to follow for optimal results.
`,
				},
				nextMessage,
			],
			max_tokens: 2048,
		});

		const { message } = response.data.choices[0];

		if (message) {
			console.log("<<< OUTPUT Message >>>");
			console.log(message.content);
			return {
				...message,
				content: extractCode(message.content).replace(
					/(ADD|TEMPLATE|OUTPUT FORMAT|REMOVE).*\n/,
					""
				),
				task,
				id: nanoid(),
			};
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

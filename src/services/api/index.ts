import { ChatCompletionRequestMessage } from "openai";
import { nanoid } from "nanoid";
import { openai } from "@/services/api/openai";
import { extractCode, miniPrompt } from "@/utils";

export async function toOpenAI({
	prompt = "extend the code",
	negativePrompt = "",
	template = "",
	model = "gpt-3.5-turbo",
	temperature = "0.2",
	maxTokens = "2048",
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

	const task = `${prompt_}${negativePrompt_ ? ` | not(${negativePrompt_})` : ""}`;

	try {
		const response = await openai.createChatCompletion({
			model,
			temperature: Number.parseFloat(temperature),
			messages: [
				{
					role: "system",
					content: miniPrompt`
					As a JavaScript expert, you optimize performance and create interactive experiences. You are absurdly creative.
					Follow these guidelines closely for optimal results:

					* Use "ADD" and "REMOVE" guidelines to modify code as needed.
					* Use short comments and follow TODO statements
					* Always output the complete code, including the original "TEMPLATE" minus "REMOVE" plus "ADD".
					* Use valid JavaScript exclusively in a markdown code block using the provided "TEMPLATE".
					* Keep a "CHANGELOG" to document changes made to the code.
					* Always change the code in some way
					* Modify the "TEMPLATE" when adding new code elements for continuous improvement.
    				`,
				},
				nextMessage,
			],
			max_tokens: Number.parseInt(maxTokens, 10),
		});

		const { message } = response.data.choices[0];

		if (message) {
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

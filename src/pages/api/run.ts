import fs from "node:fs/promises";
import path from "node:path";
import { NextApiRequest, NextApiResponse } from "next";

const outputFile = path.join(__dirname, "../../../../project/src/index.js");

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case "POST":
			if (request.body.content) {
				await fs.writeFile(outputFile, request.body.content);
				return response.status(200).json({});
			}
			return response.status(500).json({});
		default:
			return response.status(405).json({});
	}
}

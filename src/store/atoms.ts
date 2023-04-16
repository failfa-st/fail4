import { atomWithStorage } from "jotai/utils";

import { base } from "@/constants";

export const answersAtom = atomWithStorage<
	{
		id: string;
		content: string;
		task: string;
	}[]
>("fail4", [
	{
		id: "1",
		content: base.default,
		task: "Base Script",
	},
]);
export const showCodeAtom = atomWithStorage("fail4-editor", false);

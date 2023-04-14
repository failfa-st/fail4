import Script from "next/script";

export default function Page() {
	return (
		<>
			<canvas id="canvas" />
			<Script src="/js/utils.js" />
		</>
	);
}

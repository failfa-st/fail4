import Script from "next/script";

const styles = (
	<style>
		{`
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		html, body {
			height: 100%;
			width: 100%;
			overflow: hidden;
		    background: #a9a9a9;
		}
		#__next {
			display: contents;
		}
		`}
	</style>
);
export default function Page() {
	return (
		<>
			{styles}
			<canvas id="canvas" style={{}} />
			<Script src="/js/utils.js" />
		</>
	);
}

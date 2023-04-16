const canvas = document.querySelector("#canvas");

function handleResize() {
	requestAnimationFrame(() => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	});
}
handleResize();
window.addEventListener("resize", handleResize, { passive: true });

const clients = {
	host: "__ESDEKA::host__",
	guest: "__ESDEKA::guest__",
};

// Shared communicators

function subscribe(channel, callback) {
	function handleMessage(event) {
		if (
			event.data.client &&
			Object.values(clients).includes(event.data.client) &&
			event.data.channel === channel
		) {
			callback(event);
		}
	}
	window.addEventListener("message", handleMessage);

	return () => {
		window.removeEventListener("message", handleMessage);
	};
}
const host = {};
// Guest communicators

function answer(window_, channel, targetOrigin = "*") {
	window_.postMessage(
		{
			client: clients.guest,
			channel,
			action: {
				type: "answer",
			},
		},
		targetOrigin
	);
}

function handleTemplate(template) {
	Function("Template", `${template};`)();
}

subscribe("fail4", event => {
	const { action } = event.data;
	switch (action.type) {
		case "call":
			host.current = event.source;
			answer(event.source, "fail4");
			handleTemplate(action.payload.template);
			break;
		case "broadcast":
			handleTemplate(action.payload.template);
			break;
		default:
			break;
	}
});

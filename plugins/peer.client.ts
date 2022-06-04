export default defineNuxtPlugin(async (app) => {
	if (process.client) {
		const { Peer } = await import("peerjs");
		const peer = new Peer();
		return {
			provide: {
				peer,
			},
		};
	}
});

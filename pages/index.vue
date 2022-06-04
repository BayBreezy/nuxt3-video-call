<template>
	<div class="min-h-screen">
		<Snackbar />
		<main v-if="notConnected" class="md:pt-32 pt-16">
			<h1 class="text-center font-bold md:text-5xl text-3xl capitalize mb-16">
				Start chatting with a friend
			</h1>
			<section
				class="lg:max-w-2xl mx-3 md:p-5 py-5 px-2 rounded-xl md:mx-auto border"
			>
				<h2 class="text-lg mb-10 text-center md:text-left">My ID</h2>

				<div class="flex flex-col md:flex-row items-center md:gap-6">
					<span
						@click="copyMyId"
						class="py-3 px-1 md:px-2 w-full rounded-lg border border-gray-400 select-all text-center md:text-left"
					>
						{{ myId ? myId : "Loading..." }}
					</span>
					<ClientOnly>
						<div class="flex gap-6 pt-5 md:pt-0">
							<button
								v-if="copySupported"
								@click="copyMyId"
								class="bg-black text-white flex items-center space-x-3 rounded-lg p-3"
							>
								<Icon icon="akar-icons:copy" class="w-6 h-6" />
								<span class="block md:hidden">Copy</span>
							</button>
							<button
								v-if="isSupported"
								@click="shareId"
								class="bg-black text-white flex items-center space-x-3 rounded-lg p-3"
							>
								<Icon icon="ic:round-share" class="w-6 h-6" />
								<span class="block md:hidden">Share</span>
							</button>
						</div>
					</ClientOnly>
				</div>
				<p class="text-sm text-center md:text-left italic mt-8">
					Share this with a friend to get started
				</p>
			</section>
			<section
				class="lg:max-w-2xl mx-3 md:p-5 py-5 px-2 rounded-xl md:mx-auto border mt-14"
			>
				<h2 class="text-lg mb-10 text-center md:text-left">
					Connect With A Friend
				</h2>

				<div class="flex flex-col md:flex-row items-center gap-6">
					<input
						type="text"
						v-model="friendId"
						class="py-3 px-2 w-full rounded-lg border border-gray-400"
					/>
					<button
						@click="connect()"
						:class="{ 'bg-black': !friendId, 'bg-green-700': friendId }"
						class="rounded-lg py-3 px-10 w-full md:w-auto"
					>
						<span class="text-white">Connect</span>
					</button>
				</div>
				<p class="text-sm text-center md:text-left italic mt-8">
					Add friend ID to connect and chat
				</p>
			</section>
		</main>
		<main v-else class="min-h-screen bg-black">
			<div class="rounded-lg h-screen relative w-full">
				<div
					class="absolute z-20 bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 inline-block"
				>
					<button
						title="End Call"
						@click="disconnect()"
						class="bg-red-600 rounded-full p-3"
					>
						<Icon icon="material-symbols:call-end" class="w-5 h-5 text-white" />
					</button>
					<button
						v-if="enableShareScreen"
						title="Stop Share Screen"
						@click="stopSharing()"
						class="bg-amber-600 rounded-full p-3 ml-5"
					>
						<Icon icon="mdi-close" class="w-5 h-5 text-white" />
					</button>
					<button
						title="Share Screen"
						v-else
						@click="shareScreen()"
						class="bg-green-600 rounded-full p-3 ml-5"
					>
						<Icon
							icon="material-symbols:ios-share-rounded"
							class="w-5 h-5 text-white"
						/>
					</button>
					<button
						title="Fullscreen"
						@click="toggle()"
						class="rounded-full bg-white p-3 ml-5"
					>
						<Icon
							v-if="!isFullscreen"
							icon="mdi:arrow-expand-all"
							class="w-5 h-5"
						/>
						<Icon v-else icon="lucide:shrink" class="w-5 h-5" />
					</button>
				</div>
				<video
					muted
					autoplay
					ref="remotevideo"
					class="w-full rounded-lg h-full"
				></video>
			</div>
		</main>
	</div>
</template>

<script setup>
	import { Icon } from "@iconify/vue";
	// Set page title & meta
	useHead({
		title: "Video Chat App",
		meta: [
			{
				name: "description",
				content: "Video Chat App built with Nuxt 3 & PeerJS",
			},
			{
				name: "keywords",
				content: "video chat, video, chat, app, web, webRTC",
			},
			{
				name: "author",
				content: "Behon Baker",
			},
		],
	});

	// bring in Peer
	const $peer = usePeer();
	// ref for video element
	const remotevideo = ref(null);

	// Vue use stuff
	const { stream, isSupported: mediaStreamSupported } = useUserMedia({
		enabled: true,
	});
	const { isFullscreen, enter, exit, toggle } = useFullscreen();
	const { share, isSupported } = useShare();
	const { copy, isSupported: copySupported } = useClipboard({});
	//Screenshare stuff from vue use
	const {
		stream: screenShareStream,
		start,
		stop,
		enabled: enableShareScreen,
	} = useDisplayMedia({});

	// variables that will be used
	const myId = ref(null);
	// store friend ID
	const friendId = ref(null);
	//state for connection
	const notConnected = ref(true);
	// Check if an id is in the URL and add it to friend value
	if (useRoute().query.id) {
		friendId.value = useRoute().query.id;
	}

	// method used to share screen with friend
	const shareScreen = async () => {
		if (!friendId.value) return;
		await start();

		//Call friend
		let call = $peer.call(friendId.value, screenShareStream.value);
		notConnected.value = false;
		call.on("stream", (remoteStream) => {
			remotevideo.value.srcObject = remoteStream;
		});
	};

	// Method used to stop screen sharing and connect to camera streeam again
	const stopSharing = async () => {
		await stop();
		await connect();
	};

	// PeerJS event listeners
	$peer?.on("open", () => {
		myId.value = $peer.id;
	});

	// handle peerr events
	$peer?.on("error", (err) => {
		notConnected.value = true;
		friendId.value = null;
		console.log(err);
	});
	// Handle closing of peer
	$peer?.on("close", () => {
		notConnected.value = true;
		friendId.value = null;
	});
	$peer?.on("disconnected", () => {
		notConnected.value = true;
		friendId.value = null;
	});

	// Handle incoming calls
	$peer?.on("call", (call) => {
		call.answer(stream.value); // Answer the call with an A/V stream.
		notConnected.value = false;
		call.on("stream", (remoteStream) => {
			remotevideo.value.srcObject = remoteStream;
		});
		call.on("close", () => {
			disconnect();
		});
		call.on("error", (err) => {
			disconnect();
		});
	});

	// Function used to end a call
	const disconnect = async () => {
		$peer.disconnect();
		notConnected.value = true;
		friendId.value = null;
		$peer.reconnect();
	};

	// Function used to connect to other peer
	const connect = async () => {
		try {
			if (!friendId.value) return;
			// Connect to other peer
			let conn = $peer.connect(friendId.value);

			// Listen for a closed connection
			conn.on("close", () => {
				notConnected.value = true;
				friendId.value = null;
			});

			// listen for an error
			conn.on("error", (err) => {
				notConnected.value = true;
				friendId.value = null;
				console.log(err);
			});

			//Call friend
			const call = await $peer?.call(friendId.value, stream.value);
			notConnected.value = false;

			// Listen for stream from friend & add it to my video element
			call.on("stream", (remoteStream) => {
				remotevideo.value.srcObject = remoteStream;
			});

			// if the call ended, close the connection
			call.on("close", () => {
				this.disconnect();
			});
			//Same for error
			call.on("error", (err) => {
				this.disconnect();
			});
		} catch (err) {
			console.log(err);
		}
	};

	// Method used to share ID
	const shareId = () => {
		if (isSupported) {
			share({
				title: "Join me for a video chat",
				text: `Here is my ID: ${myId.value}`,
				url: window.location.href + `?id=${myId.value}`,
			});
		} else {
			useSnack("Share is not suppoerted on this device", "red");
		}
	};

	// Method used to copy myId to the clipboard
	const copyMyId = () => {
		if (copySupported) {
			copy(myId.value);
			useSnack("Copied to clipboard", "green");
		} else {
			useSnack("Copy is not supported on this device", "red");
		}
	};
</script>

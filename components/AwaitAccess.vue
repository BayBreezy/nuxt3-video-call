<template>
	<Teleport to="body">
		<transition name="fade">
			<div
				v-if="microphoneAccess !== 'granted' || cameraAccess !== 'granted'"
				class="fixed inset-0 flex bg-white items-center justify-center"
			>
				<div>
					<img
						src="/favicon.ico"
						alt="Icon Image"
						class="mx-auto h-52 object-contain mb-10"
					/>
					<h1 class="font-bold md:text-3xl text-xl text-center">
						Please grant permission to use your camera and mic.
					</h1>
				</div>
			</div>
		</transition>
	</Teleport>
</template>

<script setup>
	const microphoneAccess = usePermission("microphone");
	const cameraAccess = usePermission("camera");
</script>

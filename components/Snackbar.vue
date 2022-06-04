<template>
	<Teleport to="body">
		<transition name="fade">
			<div
				:style="{ color: color }"
				v-if="showSnack"
				class="fixed flex bg-white items-center p-4 md:top-5 top-1 left-1/2 -translate-x-1/2 rounded shadow-lg z-50 w-full md:w-auto"
			>
				<span class="text-[15px] ml-2">{{ snackText }}</span>
			</div>
		</transition>
	</Teleport>
</template>

<script setup>
	const showSnack = useShowSnack();
	const snackText = useSnackText();
	const color = useSnackColor();
</script>

<style scoped>
	.fade-enter-active,
	.fade-leave-active {
		transition: all 0.3s ease;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}
</style>

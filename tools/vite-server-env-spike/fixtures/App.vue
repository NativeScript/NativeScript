<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>

<template>
	<StackLayout>
		<Label :text="`Count ${count}`" class="title" />
		<Button text="Tap" @tap="count++" />
	</StackLayout>
</template>

<style scoped>
.title {
	color: red;
}
</style>

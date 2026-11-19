<template>
	<StackLayout class="counter">
		<Label class="count" :text="label" />
		<Button :class="$style.tap" text="Tap" @tap="count++" />
	</StackLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'nativescript-vue';
import { formatCount } from '../utils/format';

const count = ref(0);
const label = computed(() => formatCount(count.value));
</script>

<style scoped>
.count {
	color: #65adf1;
	text-align: center;
}
</style>

<style module>
.tap {
	color: #ffffff;
	background-color: #65adf1;
}
</style>

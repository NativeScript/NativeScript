<template>
	<Frame>
		<Page>
			<ActionBar>
				<Label text="Home" />
			</ActionBar>

			<StackLayout>
				<Label :class="$style.title" :text="message" />
				<Counter />
			</StackLayout>
		</Page>
	</Frame>
</template>

<script setup lang="ts">
import { computed } from 'nativescript-vue';
import Counter from './Counter.vue';

const message = computed(() => 'Blank {N}-Vue app');
</script>

<style module>
.title {
	font-size: 20;
	text-align: center;
	color: #333333;
}
</style>

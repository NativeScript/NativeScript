<template>
  <Label :text="label" />
</template>

<script setup lang="ts">
// A component whose setup throws when told to: the region it is in reports the error and stays empty, and the rest of the page renders.
const props = defineProps<{ fail: boolean }>();

function check(fail: boolean): string {
  if (fail) throw new Error('Faulty failed to render, on purpose');
  return 'Faulty rendered';
}

const label = check(props.fail);
</script>

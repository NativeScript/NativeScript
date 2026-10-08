<template>
  <Frame>
    <Page>
      <ActionBar title="Kit" />
      <StackLayout>
        <Label :text="`Tapped ${count} times`" />
        <Button text="Tap" @tap="count++" />
      </StackLayout>
    </Page>
  </Frame>
</template>

<script setup lang="ts">
import { ref } from 'nativescript-vue';

const count = ref(0);
</script>

<template>
  <Frame>
    <Page>
      <ActionBar title="Kit">
        <ActionItem text="Add" ios.position="right" @tap="count++" />
        <ActionItem icon="sys://star.fill" ios.position="right" />
      </ActionBar>
      <!-- Core's views rendered at launch: a launch on an older iOS reaches the code each runs there. -->
      <ScrollView>
        <StackLayout padding="12">
          <Label :text="`Tapped ${count} times`" class="title" />
          <Button text="Tap" @tap="count++" />
          <TextField hint="Name" text="Ada" />
          <TextView text="Notes" height="60" />
          <SearchBar hint="Search" />
          <Switch :checked="count % 2 === 0" />
          <Slider :value="count" minValue="0" maxValue="10" />
          <Progress :value="count" maxValue="10" />
          <ActivityIndicator busy="true" />
          <SegmentedBar :selectedIndex="0">
            <SegmentedBarItem title="One" />
            <SegmentedBarItem title="Two" />
          </SegmentedBar>
          <DatePicker height="120" />
          <TimePicker height="120" />
          <ListPicker :items="['a', 'b', 'c']" height="100" />
          <HtmlView html="<b>Bold</b> text" />
          <Image src="sys://heart.fill" width="24" height="24" />
          <ListView :items="['one', 'two', 'three']" height="120">
            <template #default="{ item }">
              <Label :text="item" />
            </template>
          </ListView>
          <GridLayout columns="*, auto" rows="auto">
            <Label text="Grid" col="0" />
            <Label text="cell" col="1" />
          </GridLayout>
          <FlexboxLayout flexWrap="wrap">
            <Label text="Flex" />
            <Label text="box" />
          </FlexboxLayout>
          <WrapLayout>
            <Label text="Wrap" />
          </WrapLayout>
          <DockLayout height="40">
            <Label text="Dock" dock="left" />
          </DockLayout>
          <AbsoluteLayout height="40">
            <Label text="Absolute" left="10" top="10" />
          </AbsoluteLayout>
          <TabView height="200" :selectedIndex="0">
            <TabViewItem title="First">
              <Label text="First tab" />
            </TabViewItem>
            <TabViewItem title="Second">
              <Label text="Second tab" />
            </TabViewItem>
          </TabView>
        </StackLayout>
      </ScrollView>
    </Page>
  </Frame>
</template>

<script setup lang="ts">
import { ref } from 'nativescript-vue';

const count = ref(0);
</script>

<style>
.title {
  font-size: 18;
  font-weight: bold;
}
</style>

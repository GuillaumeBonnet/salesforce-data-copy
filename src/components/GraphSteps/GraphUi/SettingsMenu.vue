<template>
  <q-btn class="" flat round color="secondary" icon="settings">
    <q-menu
      anchor="bottom left"
      self="top left"
      class="flex p-8 overflow-hidden bg-gray-600 bg-opacity-90 shadow-lg shadow-slate-500 border border-slate-400"
    >
      <SliderWithoutMax
        label="Node distance"
        v-model="spacingFactor"
      ></SliderWithoutMax>
      <SliderWithoutMax
        class="ml-3"
        label="Zoom level"
        v-model="zoomLevel"
      ></SliderWithoutMax>
    </q-menu>
  </q-btn>
</template>
<script lang="ts" setup>
import SliderWithoutMax from './SliderWithoutMax.vue';

const spacingFactor = defineModel('spacingFactor');
const zoomLevel = defineModel('zoomLevel');
</script>

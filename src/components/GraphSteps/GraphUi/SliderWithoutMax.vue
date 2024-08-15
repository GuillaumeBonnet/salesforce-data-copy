<template>
  <div class="flex-col flex">
    <q-badge color="secondary" class="mb-4">{{ label }}</q-badge>
    <q-slider
      class="flex justify-center"
      v-model="model"
      :min="0"
      :max="max"
      :step="0"
      vertical
      label
      track-color="grey"
      color="secondary"
      marker-labels
      reverse
    >
      <template v-slot:marker-label-group="{ markerList }">
        <div
          :class="markerList[max].classes + ' flex flex-nowrap'"
          :style="markerList[max].style"
        >
          <q-icon
            size="sm"
            color="white"
            name="arrow_left"
            class="cursor-pointer"
            @click="max /= 10"
          />
          {{ max }}
          <q-icon
            size="sm"
            color="white"
            name="arrow_right"
            @click="max *= 10"
            class="cursor-pointer"
          />
        </div>
      </template>
    </q-slider>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    maxDef?: number;
  }>(),
  {
    label: '',
  }
);

const model = defineModel({
  default: 1,
});
const max = ref(props.maxDef || 10);
</script>

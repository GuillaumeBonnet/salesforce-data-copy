<template>
  <div class="">
    <q-select
      outlined
      v-model="selection"
      :options="props.options"
      :label="props.label"
      :disable="props.disable"
      :dropdown-icon="props.successfulConnection ? 'cloud_done' : 'cloud_off'"
    />
    <div class="text-red-600">{{ props.errorMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    disable?: boolean;
    options: string[];
    errorMsg?: string;
    successfulConnection: boolean;
    modelValue: string;
  }>(),
  {
    disable: false,
    label: '',
    errorMsg: '',
    options: () => [],
    successfulConnection: false,
    modelValue: '',
  }
);
const emit = defineEmits(['update:modelValue']);

const selection = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
</script>

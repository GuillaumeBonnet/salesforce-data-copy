<template>
  <div class="">
    <q-select
      outlined
      v-model="selection"
      :options="optionsWithDisabled"
      :label="props.label"
      :disable="props.disable"
      :dropdown-icon="props.successfulConnection ? 'cloud_done' : 'cloud_off'"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section v-if="scope.opt.isExpired" avatar>
            <q-icon name="close" color="red" />
            <q-tooltip :delay="700">Expired</q-tooltip>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <!-- <q-item-label caption>{{ scope.opt.description }}</q-item-label> -->
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <div class="text-red-600">{{ props.errorMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { OptionSandbox } from 'src/models/types';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    disable?: boolean;
    options: OptionSandbox[];
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
    return props.options.find((option) => option.value == props.modelValue);
  },
  set(value) {
    emit('update:modelValue', value?.value);
  },
});
const optionsWithDisabled = computed(() => {
  return props.options.map((option) => ({
    ...option,
    disable: option.isExpired,
  }));
});
</script>

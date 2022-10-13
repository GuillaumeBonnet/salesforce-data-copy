<template>
  <div class="flex w-12/12 mx-auto items-center justify-center gap-2">
    <select-organization
      label="From sandbox"
      class="w-4/12"
      v-bind="fromSandbox"
      v-model="fromSandbox.selection"
    ></select-organization>
    <!-- :options="fromSandbox.options"
      :successful-connection="fromSandbox.successfulConnection" -->
    <q-icon
      name="double_arrow"
      size="3em"
      :color="bothSandboxPicked ? 'white' : 'grey'"
    />
    <select-organization
      label="To sandbox"
      class="w-4/12"
      v-bind="toSandbox"
      v-model="toSandbox.selection"
    ></select-organization>
  </div>
  <div class="">
    <q-btn
      label="Test connections"
      @click="testConnections()"
      :disable="!bothSandboxPicked"
      class="mx-auto my-8 block"
      color="secondary"
      icon-right="cloud"
    />
  </div>
  <div class="flex justify-center items-center gap-2 wrap">
    <div class="underline w-full text-lg">Initial query:</div>
    <q-input
      class=""
      ref="inputSObject"
      outlined
      v-model="queryBits.sOjectName"
      label="SObject Name"
      :rules="[(val) => !!val || 'Field is required']"
    />
    <span class="">WHERE</span>
    <q-input
      class=""
      ref="inputWhere"
      outlined
      v-model="queryBits.whereClause"
      label="Type filter"
      :rules="[
        (val) => !!val || 'Field is required',
        (val) =>
          (val && !val.toUpperCase().startsWith('WHERE')) ||
          `Don't add WHERE in the filter.`,
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { $ } from 'app/dist/electron/UnPackaged/assets/index.cbc5386a';
import { QInput } from 'quasar';
import { computed, onMounted, reactive, watch } from 'vue';
import { ref } from 'vue';
import SelectOrganization from './SelectOrganization.vue';

onMounted(async () => {
  fromSandbox.options = await window.electronApi.sfdx.getAliases();
});

const emit = defineEmits<{
  (e: 'isNextStepDisabled', value: boolean): void;
}>();

const fromSandbox = reactive({
  selection: '',
  options: [] as string[],
  errorMsg: '',
  successfulConnection: false,
});
const toSandbox = reactive({
  selection: '',
  options: [] as string[],
  errorMsg: '',
  successfulConnection: false,
  disable: computed(() => {
    return !fromSandbox.selection;
  }),
});

watch(
  () => fromSandbox.selection,
  (value, oldValue) => {
    toSandbox.selection = '';
    toSandbox.options = fromSandbox.options.filter((option) => option != value);
    fromSandbox.errorMsg = '';
    fromSandbox.successfulConnection = false;
  }
);

watch(
  () => toSandbox.selection,
  (value, oldValue) => {
    toSandbox.errorMsg = '';
    toSandbox.successfulConnection = false;
  }
);

const bothSandboxPicked = computed(() => {
  return fromSandbox.selection && toSandbox.selection;
});

const testConnections = async () => {
  const result = await window.electronApi.sfdx.testConnections({
    fromUsername: fromSandbox.selection,
    toUsername: toSandbox.selection,
  });
  fromSandbox.errorMsg = result.fromSandbox.errorMsg;
  fromSandbox.successfulConnection = result.fromSandbox.successfulConnection;

  toSandbox.errorMsg = result.toSandbox.errorMsg;
  toSandbox.successfulConnection = result.toSandbox.successfulConnection;
};

const inputSObject = ref<QInput>();
const inputWhere = ref<QInput>();
const queryBits = reactive({
  sOjectName: '',
  whereClause: '',
});

watch(
  () => {
    return (
      !fromSandbox.successfulConnection ||
      !toSandbox.successfulConnection ||
      !queryBits.sOjectName ||
      !queryBits.whereClause ||
      !inputSObject.value ||
      inputSObject.value.hasError ||
      !inputWhere.value ||
      inputWhere.value.hasError
    );
  },
  (val) => {
    emit('isNextStepDisabled', val);
  }
);

// AccountRef1      Account            0011x00001fVmNUAA0
// AccountRef2      Account            0011x00001fVmNVAA0
// AccountRef3      Account            0011x00001fVmNWAA0
// DynamoRef        Product_Family__c  a021x000004thJEAAY
// FuseRef          Product_Family__c  a021x000004thJFAAY
// ElectraRef       Product_Family__c  a021x000004thJGAAY
// VoltRef          Product_Family__c  a021x000004thJHAAY
// Product__cRef1   Product__c         a031x000008RYLgAAO
// Product__cRef2   Product__c         a031x000008RYLhAAO
// Product__cRef3   Product__c         a031x000008RYLiAAO
// Product__cRef4   Product__c         a031x000008RYLjAAO
// Product__cRef5   Product__c         a031x000008RYLkAAO
// Product__cRef6   Product__c         a031x000008RYLlAAO
// Product__cRef7   Product__c         a031x000008RYLmAAO
// Product__cRef8   Product__c         a031x000008RYLnAAO
// Product__cRef9   Product__c         a031x000008RYLoAAO
// Product__cRef10  Product__c         a031x000008RYLpAAO
// Product__cRef11  Product__c         a031x000008RYLqAAO
// Product__cRef12  Product__c         a031x000008RYLrAAO
// Product__cRef13  Product__c         a031x000008RYLsAAO
// Product__cRef14  Product__c         a031x000008RYLtAAO
// Product__cRef15  Product__c         a031x000008RYLuAAO
// Product__cRef16  Product__c         a031x000008RYLvAAO
</script>

<template>
  <div class="flex w-12/12 mx-auto items-center justify-center gap-2">
    <select-organization
      label="From sandbox"
      class="w-4/12"
      v-bind="fromSandbox"
      v-model="currentInitCond.fromUsername"
    ></select-organization>
    <q-icon
      name="double_arrow"
      size="3em"
      :color="bothSandboxPicked ? 'white' : 'grey'"
    />
    <select-organization
      label="To sandbox"
      class="w-4/12"
      v-bind="toSandbox"
      v-model="currentInitCond.toUsername"
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
      v-model="currentInitCond.queryBits.sObjectName"
      label="SObject Name"
      :rules="[(val) => !!val || 'Field is required']"
    />
    <span class="">WHERE</span>
    <q-input
      class=""
      ref="inputWhere"
      outlined
      v-model="currentInitCond.queryBits.whereClause"
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
import { QInput } from 'quasar';
import { computed, nextTick, onMounted, reactive, watch } from 'vue';
import { ref } from 'vue';
import SelectOrganization from './SelectOrganization.vue';

let previousInitCond: Awaited<
  ReturnType<typeof window.electronApi.persistentStore.getInitialConditions>
>;
const currentInitCond: typeof previousInitCond = reactive({
  fromUsername: '',
  toUsername: '',
  queryBits: {
    sObjectName: '',
    whereClause: '',
  },
});
onMounted(async function () {
  fromSandbox.options = await window.electronApi.sfdx.getAliases();
  previousInitCond =
    await window.electronApi.persistentStore.getInitialConditions();
  Object.assign(currentInitCond, previousInitCond); // reactive obj have to stay the same ref (use const)
  if (
    currentInitCond.fromUsername &&
    !fromSandbox.options.includes(currentInitCond.fromUsername)
  ) {
    currentInitCond.fromUsername = '';
  }
  nextTick(() => {
    if (
      previousInitCond.toUsername &&
      toSandbox.options.includes(previousInitCond.toUsername)
    ) {
      currentInitCond.toUsername = previousInitCond.toUsername; //had be removed when we assigned currentInitCond.toUsername
    }
  });
});

const emit = defineEmits<{
  (e: 'isNextStepDisabled', value: boolean): void;
}>();

const fromSandbox = reactive({
  options: [] as string[],
  errorMsg: '',
  successfulConnection: false,
});
const toSandbox = reactive({
  options: [] as string[],
  errorMsg: '',
  successfulConnection: false,
  disable: computed(() => {
    return !currentInitCond.fromUsername;
  }),
});

watch(
  () => currentInitCond.fromUsername,
  (value, oldValue) => {
    currentInitCond.toUsername = '';
    toSandbox.options = fromSandbox.options.filter((option) => option != value);
    fromSandbox.errorMsg = '';
    fromSandbox.successfulConnection = false;
  }
);

watch(
  () => currentInitCond.toUsername,
  (value, oldValue) => {
    toSandbox.errorMsg = '';
    toSandbox.successfulConnection = false;
  }
);

const bothSandboxPicked = computed(() => {
  return currentInitCond.fromUsername && currentInitCond.toUsername;
});

const testConnections = async () => {
  const result = await window.electronApi.sfdx.testConnections({
    fromUsername: currentInitCond.fromUsername,
    toUsername: currentInitCond.toUsername,
  });
  fromSandbox.errorMsg = result.fromSandbox.errorMsg;
  fromSandbox.successfulConnection = result.fromSandbox.successfulConnection;

  toSandbox.errorMsg = result.toSandbox.errorMsg;
  toSandbox.successfulConnection = result.toSandbox.successfulConnection;
};

const inputSObject = ref<QInput>(); // to read the .hasError
const inputWhere = ref<QInput>();

watch(
  () => {
    return (
      !fromSandbox.successfulConnection ||
      !toSandbox.successfulConnection ||
      !currentInitCond.queryBits.sObjectName ||
      !currentInitCond.queryBits.whereClause ||
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

const saveInitCondIfChanged = async () => {
  const output = { hasChanged: false };
  if (
    currentInitCond.fromUsername != previousInitCond.fromUsername ||
    currentInitCond.toUsername != previousInitCond.toUsername ||
    currentInitCond.queryBits.sObjectName !=
      previousInitCond.queryBits.sObjectName ||
    currentInitCond.queryBits.whereClause !=
      previousInitCond.queryBits.whereClause
  ) {
    await window.electronApi.persistentStore.setInitialConditions(
      JSON.parse(JSON.stringify(currentInitCond)) // extract from proxy
    );
    output.hasChanged = true;
  }
  return output;
};
defineExpose({
  saveInitCondIfChanged,
});

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

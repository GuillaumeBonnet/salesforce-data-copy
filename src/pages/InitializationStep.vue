<template>
  <!-- <div class="flex w-12/12 mx-auto items-center justify-center gap-2">
    <q-select
      class="w-4/12"
      outlined
      v-model="fromSandbox.ref"
      :options="fromSandbox.options"
      label="From sandbox"
      :dropdown-icon="
        fromSandbox.successfulConnection ? 'cloud_done' : 'cloud_off'
      "
    />
    <q-icon
      name="double_arrow"
      size="3em"
      :color="bothSandboxPicked ? 'white' : 'grey'"
    />
    <q-select
      class="w-4/12"
      outlined
      v-model="toSandbox.ref"
      :options="toSandbox.options"
      label="To sandbox"
      :disable="toSandbox.disabled"
      :dropdown-icon="
        toSandbox.successfulConnection ? 'cloud_done' : 'cloud_off'
      "
    />
  </div>
  <div class="">
    <q-btn
      :disable="!bothSandboxPicked"
      class="mx-auto my-8 block"
      color="secondary"
      icon-right="cloud"
      label="Test connections"
    />
  </div> -->

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
      @click="onclick"
      :disable="!bothSandboxPicked"
      class="mx-auto my-8 block"
      color="secondary"
      icon-right="cloud"
    />
  </div>
</template>

<script setup lang="ts">
import { $ } from 'app/dist/electron/UnPackaged/assets/index.cbc5386a';
import { computed, onMounted, reactive, watch } from 'vue';
import { ref } from 'vue';
import SelectOrganization from './SelectOrganization.vue';

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
  }
);

const bothSandboxPicked = computed(() => {
  return fromSandbox.selection && toSandbox.selection;
});
const onclick = () => {
  setTimeout(() => {
    fromSandbox.successfulConnection = !fromSandbox.successfulConnection;
    toSandbox.errorMsg += '- AAA- ';
  }, 1000);
};
onMounted(async () => {
  fromSandbox.options = await electronAPI.getAliases();
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

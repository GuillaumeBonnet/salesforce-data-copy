<template>
  <div class="underline w-full text-lg">Chose sandboxes:</div>
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
    <q-btn
      push
      color="grey-7"
      text-color="white"
      round
      icon="add"
      title="My sandbox is not in the list ?"
      @click="popupAddSandbox()"
    />
  </div>
  <div class="">
    <q-btn
      label="Test connections"
      @click="testConnections()"
      :loading="isTestConOngoing"
      :disable="!bothSandboxPicked"
      class="mx-auto my-8 block"
      color="secondary"
      icon-right="cloud"
    />
  </div>
  <div class="flex justify-center items-center gap-2 wrap">
    <div class="underline w-full text-lg">Chose initial query:</div>
    <q-select
      class=""
      ref="inputSObject"
      outlined
      use-input
      fill-input
      :options="optionsObjects"
      @filter="filterFn"
      input-debounce="0"
      hide-selected
      v-model="currentInitCond.queryBits.sObjectName"
      label="SObject Name"
      :rules="[(val) => !!val || 'Field is required']"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey"> No results </q-item-section>
        </q-item>
      </template>
    </q-select>
    <span class="">WHERE</span>
    <q-input
      class=""
      ref="inputWhere"
      outlined
      v-model="currentInitCond.queryBits.whereClause"
      label="Query filter"
      :rules="[
        (val) =>
          !!val || 'Filter required, space character to querry the whole table',
        (val) =>
          (val && !val.toUpperCase().startsWith('WHERE')) ||
          `Don't add WHERE in the filter.`,
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { QInput, useQuasar } from 'quasar';
import { computed, nextTick, onMounted, reactive, watch } from 'vue';
import { ref } from 'vue';
import SelectOrganization from './SelectOrganization.vue';
import { OptionSandbox } from 'src/models/types';
import NewConnectionSandbox from './NewConnectionSandbox.vue';

let previousInitCond: Awaited<
  ReturnType<typeof window.electronApi.persistentStore.getInitialConditions>
> = reactive({
  fromUsername: '',
  toUsername: '',
  queryBits: {
    sObjectName: '',
    whereClause: '',
  },
});
let currentInitCond: typeof previousInitCond = reactive({
  fromUsername: '',
  toUsername: '',
  queryBits: {
    sObjectName: '',
    whereClause: '',
  },
});
let objectList: string[] = [];
onMounted(async function () {
  fromSandbox.options = await (
    await window.electronApi.sfdx.getAliases()
  ).map((aliasAndUsername) => ({
    label: `${aliasAndUsername.alias}(${aliasAndUsername.username})`,
    value: aliasAndUsername.username,
    isExpired: aliasAndUsername.isExpired,
  }));
  Object.assign(
    currentInitCond,
    await window.electronApi.persistentStore.getInitialConditions(),
  ); // reactive obj have to stay the same ref (use const)
  Object.assign(previousInitCond, JSON.parse(JSON.stringify(currentInitCond)));
  if (
    currentInitCond.fromUsername &&
    !fromSandbox.options
      .map((option) => option.value)
      .includes(currentInitCond.fromUsername)
  ) {
    currentInitCond.fromUsername = '';
  }
  nextTick(() => {
    if (
      previousInitCond.toUsername &&
      toSandbox.options
        .map((option) => option.value)
        .includes(previousInitCond.toUsername)
    ) {
      currentInitCond.toUsername = previousInitCond.toUsername; //had be removed when we assigned currentInitCond.toUsername
    }
  });
});

const emit = defineEmits<{
  (e: 'isNextStepDisabled', value: boolean): void;
  (e: 'isInitCondSameAsPrevious', value: boolean): void;
}>();

const fromSandbox = reactive({
  options: [] as OptionSandbox[],
  errorMsg: '',
  successfulConnection: false,
});
const toSandbox = reactive({
  options: [] as OptionSandbox[],
  errorMsg: '',
  successfulConnection: false,
  disable: computed(() => {
    return !currentInitCond.fromUsername;
  }),
});
const optionsObjects = ref(objectList);
const filterFn = (val: string, update: Function) => {
  if (val === '') {
    update(() => {
      optionsObjects.value = objectList;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    optionsObjects.value = objectList.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1,
    );
  });
};
watch(
  () => currentInitCond.fromUsername,

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (value, oldValue) => {
    currentInitCond.toUsername = '';
    toSandbox.options = fromSandbox.options.filter(
      (option) => option.value != value,
    );
    fromSandbox.errorMsg = '';
    fromSandbox.successfulConnection = false;
  },
);

watch(
  () => currentInitCond.toUsername,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (value, oldValue) => {
    toSandbox.errorMsg = '';
    toSandbox.successfulConnection = false;
  },
);

const bothSandboxPicked = computed(() => {
  return currentInitCond.fromUsername && currentInitCond.toUsername;
});

const isTestConOngoing = ref(false);
const testConnections = async () => {
  isTestConOngoing.value = true;
  const result = await window.electronApi.sfdx.testConnections({
    fromUsername: currentInitCond.fromUsername,
    toUsername: currentInitCond.toUsername,
  });
  isTestConOngoing.value = false;
  fromSandbox.errorMsg = result.fromSandbox.errorMsg;
  fromSandbox.successfulConnection = result.fromSandbox.successfulConnection;

  toSandbox.errorMsg = result.toSandbox.errorMsg;
  toSandbox.successfulConnection = result.toSandbox.successfulConnection;
  if (fromSandbox.successfulConnection && toSandbox.successfulConnection) {
    objectList = await window.electronApi.sfdx.getSobjects();
    objectList = [
      ...objectList.filter((obj) => obj.includes('__c')),
      ...objectList.filter((obj) => !obj.includes('__c')),
    ];
    optionsObjects.value = objectList;
  }
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
  },
);

const isInitCondSameAsPrevious = computed(() => {
  return (
    currentInitCond.fromUsername == previousInitCond.fromUsername &&
    currentInitCond.toUsername == previousInitCond.toUsername &&
    currentInitCond.queryBits.sObjectName ==
      previousInitCond.queryBits.sObjectName &&
    currentInitCond.queryBits.whereClause ==
      previousInitCond.queryBits.whereClause
  );
});
watch(isInitCondSameAsPrevious, (val) => {
  emit('isInitCondSameAsPrevious', val);
});

const getInitCond = async () => {
  const initCond: typeof currentInitCond & { hasChanged: boolean } = JSON.parse(
    JSON.stringify(currentInitCond),
  );
  if (
    currentInitCond.fromUsername != previousInitCond.fromUsername ||
    currentInitCond.toUsername != previousInitCond.toUsername ||
    currentInitCond.queryBits.sObjectName !=
      previousInitCond.queryBits.sObjectName ||
    currentInitCond.queryBits.whereClause !=
      previousInitCond.queryBits.whereClause
  ) {
    await window.electronApi.persistentStore.setInitialConditions(
      initCond, // extract from proxy
    );
    initCond.hasChanged = true;
  }
  return initCond;
};
const $q = useQuasar();
const popupAddSandbox = () => {
  $q.dialog({
    component: NewConnectionSandbox,
  });
};
defineExpose({
  getInitCond,
});
</script>

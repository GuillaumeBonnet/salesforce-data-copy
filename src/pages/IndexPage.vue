<template>
  <div class="q-pa-md">
    <q-stepper v-model="step" ref="stepper" color="primary" animated>
      <q-step
        :name="1"
        title="Choose sandboxes and initials records"
        icon="settings"
        :done="step > 1"
        style="min-height: 200px"
      >
        <InitializationStep
          ref="initializationStepCmp"
          @is-next-step-disabled="
            (value) => (graphBuildingStepDisabled = value)
          "
          @is-init-cond-same-as-previous="
            (value) => (isInitCondSameAsPrevious = value)
          "
        ></InitializationStep>
      </q-step>

      <q-step
        :name="2"
        title="Extract records"
        caption="sandbox from"
        icon="create_new_folder"
        :done="step > 2"
        style="min-height: 200px"
      >
        <GraphFetchData
          v-if="initRecords.length"
          :init-records="initRecords"
          @allow-next-step="upsertStepDisabled = false"
        ></GraphFetchData>
      </q-step>

      <q-step
        :name="3"
        title="Upsert records"
        caption="sandbox to"
        icon="create_new_folder"
        :done="step > 3"
        style="min-height: 200px"
      >
        <GraphUpsertion></GraphUpsertion>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="flex gap-4">
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="step == 3 ? (step = 1) : stepper?.previous()"
            label="Back"
            class="q-ml-sm"
          />
          <div class="flex-grow"></div>
          <template v-if="step == 1">
            <q-btn
              @click="goToGraphBuildingStep()"
              :color="isInitCondSameAsPrevious ? 'secondary' : 'primary'"
              label="Start data extraction"
              :disable="graphBuildingStepDisabled"
            />
            <q-btn
              v-if="isInitCondSameAsPrevious"
              @click="goToUpsertStep()"
              color="primary"
              label="Skip to upsertion"
              :disable="graphBuildingStepDisabled"
            />
          </template>
          <q-btn
            v-if="step == 2"
            @click="goToUpsertStep()"
            color="primary"
            label="Start upserting data"
            :disable="upsertStepDisabled"
          />
        </q-stepper-navigation>
      </template>

      <template v-slot:message>
        <q-banner v-if="step === 1" class="bg-purple-8 text-white q-px-lg">
          Be mindful to chose the correct "to Sandbox" that will receive the
          cloned records
        </q-banner>
        <q-banner v-else-if="step === 2" class="bg-orange-8 text-white q-px-lg">
          Fetching records from sandbox "from", it can take a while
        </q-banner>
        <q-banner v-else-if="step === 3" class="bg-orange-8 text-white q-px-lg">
          Inserting or updating records to sandbox "to", it can take a while
        </q-banner>
      </template>
    </q-stepper>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InitializationStep from 'src/components/InitializationStep.vue';
import GraphFetchData from 'src/components/GraphSteps/GraphFetchData.vue';
import { QStepper, useQuasar } from 'quasar';
import { Record } from 'jsforce';
import { notifyError, ifErrorNotif } from 'src/components/vueUtils.ts';
import { SfRecord } from 'src/models/types';
import GraphUpsertion from 'src/components/GraphSteps/GraphUpsertion.vue';
const step = ref(1);
const stepper = ref<InstanceType<typeof QStepper> | null>(null);
const graphBuildingStepDisabled = ref(true);
const isInitCondSameAsPrevious = ref(false);
const upsertStepDisabled = ref(true);
const initializationStepCmp = ref<InstanceType<
  typeof InitializationStep
> | null>(null);
const initRecords: SfRecord[] = [];
const $q = useQuasar();

const goToGraphBuildingStep = () => {
  ifErrorNotif($q, async () => {
    if (initializationStepCmp.value) {
      const initCond = await initializationStepCmp.value.getInitCond();

      while (initRecords.length > 0) {
        /* we do that to keep the reference tracked by vue
         * the array is filled if we pressed the back button once
         */
        initRecords.pop();
      }
      initRecords.push(
        ...(await window.electronApi.sfdx.queryWithAllCreatableFields(
          'FROM',
          initCond.queryBits.sObjectName,
          initCond.queryBits.whereClause
        ))
      );
      if (initRecords.length == 0) {
        notifyError($q, 'No initial records found.\nChange the initial query.');
      } else {
        stepper.value?.next();
      }
    }
  });
};

const goToUpsertStep = async () => {
  step.value = 3;
};
</script>

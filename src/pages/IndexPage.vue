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
          @is-next-step-disabled="(value) => (nextNavDisabled = value)"
        ></InitializationStep>
      </q-step>

      <q-step
        :name="2"
        title="Extract and copy records"
        caption="Caption"
        icon="create_new_folder"
        :done="step > 2"
        style="min-height: 200px"
      >
        <GraphSteps
          v-if="initRecords.length"
          :init-records="initRecords"
        ></GraphSteps>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn
            v-if="step == 1"
            @click="goToGraphStep()"
            color="primary"
            label="Start data extraction"
            :disable="nextNavDisabled"
          />
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="stepper?.previous()"
            label="Back"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </template>

      <template v-slot:message>
        <q-banner v-if="step === 1" class="bg-purple-8 text-white q-px-lg">
          Be mindful to chose the correct "to Sandbox" that will receive the
          cloned records
        </q-banner>
        <q-banner v-else-if="step === 2" class="bg-orange-8 text-white q-px-lg">
          The ad group helps you to...
        </q-banner>
      </template>
    </q-stepper>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InitializationStep from 'src/components/InitializationStep.vue';
import GraphSteps from 'src/components/GraphSteps/GraphSteps.vue';
import { QStepper, useQuasar } from 'quasar';
import { Record } from 'jsforce';
import { notifyError } from 'src/components/vueUtils';
const step = ref(1);
const stepper = ref<InstanceType<typeof QStepper> | null>(null);
const nextNavDisabled = ref(true);
const initializationStepCmp = ref<InstanceType<
  typeof InitializationStep
> | null>(null);
const initRecords: Record[] = [];
const $q = useQuasar();

const goToGraphStep = async () => {
  if (initializationStepCmp.value) {
    const initCond = await initializationStepCmp.value.getInitCond();
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
};
</script>

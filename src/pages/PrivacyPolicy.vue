<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin p-8" style="width: 700px; max-width: 80vw">
      <div class="text-h6 pb-4">Privacy Policy</div>
      <q-card-section>
        This software does not collect, store, or share any personal data on any
        servers besides the salesforce organizations "source and "target"
        belonging to the user.
      </q-card-section>
      <q-card-section>
        Any data processed by this software is handled locally on your device.
        This means that all operations, such as file processing, computations,
        or other activities, occur solely on your device, and no data is
        transmitted to any external servers beside the "target" salesforce
        organization.
      </q-card-section>
      <q-card-section>
        Credentials and password are handled by the Salesforce CLI.
      </q-card-section>
      <q-card-section>
        Cached data is stored in the config.json file that you can find here:
        <p class="pl-4">
          - macOS: ~/Library/Application
          Support/salesforce-data-copy/config.json
        </p>
        <p class="pl-4">
          - Windows: %APPDATA%\salesforce-data-copy\config.json
        </p>
        <p class="pl-4">- Linux: ~/.config/salesforce-data-copy/config.json</p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="secondary" label="Close" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { ref } from 'vue';
import { onMounted } from 'vue';

defineEmits(useDialogPluginComponent.emits);
const licenceFileContent = ref('');

// REQUIRED; must be called inside of setup()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>

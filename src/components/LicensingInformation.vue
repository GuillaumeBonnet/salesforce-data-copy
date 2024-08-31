<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin p-8" style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6 pb-4">Licensing Information</div>
        <pre style="white-space: pre-line">{{ licenceFileContent }}</pre>
      </q-card-section>
      <q-card-section>
        <div class="text-h6 pb-4">Main packages used</div>
        <ul>
          <li
            class="hover:underline cursor-pointer"
            v-for="item in mainPackages"
            @click="openLink(item.url)"
          >
            <a :title="item.url"> - {{ item.label }} </a>
          </li>
        </ul>
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

const mainPackages: Array<{
  url: Parameters<typeof window.electronApi.other.openLink>[0];
  label: string;
}> = [
  {
    url: 'https://www.npmjs.com/package/@salesforce/core',
    label: '@Salesforce/core',
  },
  { url: 'https://www.npmjs.com/package/cytoscape', label: 'cytoscape' },
  { url: 'https://quasar.dev/', label: 'Quasar' },
  { url: 'https://vuejs.org/', label: 'Vue.js' },
];

const openLink = (
  url: Parameters<typeof window.electronApi.other.openLink>[0],
) => {
  window.electronApi.other.openLink(url);
};

defineEmits(useDialogPluginComponent.emits);
const licenceFileContent = ref('');
onMounted(async () => {
  try {
    licenceFileContent.value =
      await window.electronApi.other.getLicenceContent();
  } catch (err) {
    console.error('Error reading LICENSE.MD', err);
    licenceFileContent.value = 'Error reading LICENSE.MD';
  }
});

// REQUIRED; must be called inside of setup()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>

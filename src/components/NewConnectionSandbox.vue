<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin p-8" style="width: 700px; max-width: 80vw">
      <div class="text-h5 pb-4">My sandbox is not in the list ?</div>
      <q-card-section>
        You can add a connection to an org by using
        <a
          class="underline"
          @click="
            openLink(
              'https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode',
              $event,
            )
          "
          title="https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode"
          href="https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode"
        >
          vscode's Salesforce Extension Pack
        </a>
        or
        <a
          class="underline"
          @click="
            openLink(
              'https://developer.salesforce.com/tools/salesforcecli',
              $event,
            )
          "
          title="https://developer.salesforce.com/tools/salesforcecli"
          href="https://developer.salesforce.com/tools/salesforcecli"
        >
          salesforce's CLI
        </a>
      </q-card-section>
      <q-card-section>
        <div class="underline text-h6">
          Instructions to authenticate with vscode's extension:
        </div>
        <ul class="list-disc pl-8">
          <li>
            In vscode, press Ctrl+Shift+P (Windows) or Cmd+Shift+P (macOS) to
            make the command palette appear.
          </li>
          <li>Type SFDX: Authorize an Org.</li>
          <li>Select SFDX: Authorize an Org.</li>
          <li>To accept the default login URL, press Enter.</li>
          <li>Enter an alias for your org</li>
          <li>
            Notice that your default browser opens a new Salesforce login
            window. Log in to your playground using your username and password
          </li>
          <li>
            When you are asked to grant access to the connected app, click
            Allow.
          </li>
          <li>
            Close the browser window.The command-line terminal window returns a
            success message when the transaction is complete.
          </li>
          <li>Restart salesforce-data-copy</li>
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

defineEmits(useDialogPluginComponent.emits);

const openLink = (
  url: Parameters<typeof window.electronApi.other.openLink>[0],
  event: Event,
) => {
  event.preventDefault();
  window.electronApi.other.openLink(url);
};

// REQUIRED; must be called inside of setup()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>

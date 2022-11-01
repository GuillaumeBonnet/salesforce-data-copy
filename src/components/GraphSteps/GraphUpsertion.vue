<template>
  <q-layout
    view="hHh lpR fFf"
    container
    class="rounded-md h-96 border-2 border-black"
    id="graph-layout"
  >
    GraphUpsertion
  </q-layout>
</template>

<style></style>
<script lang="ts" setup>
import { onMounted } from 'vue';

onMounted(async () => {
  const graphElements =
    await window.electronApi.persistentStore.getGraphBeforeUpsertion();
  console.log('gboDebug:[graphElements]', graphElements);
});
</script>

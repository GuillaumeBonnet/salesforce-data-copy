<template>
  <GraphUi :graph="graph" ref="graphUi"></GraphUi>
</template>

<style>
#graph-layout.q-layout-container > div > div {
  overflow: hidden;
}
</style>
<script lang="ts" setup>
import { SfRecord } from 'src/models/types';
import GraphUi from './GraphUi/GraphUi.vue';
import { errorMsg as errorMsgExtractor } from '../../../src-electron/utils';
import { useQuasar } from 'quasar';
import { getGraph } from './InitCytoscapeInstance';
import { GraphBuilder } from './GraphBuilder';
import { onMounted } from 'vue';
import { nextTick } from 'vue';
import { Log } from './Log';
import { onUnmounted } from 'vue';
import { notifyError } from 'src/components/vueUtils';

const props = defineProps<{ initRecords: SfRecord[] }>();
const emit = defineEmits<{
  (e: 'allowNextStep'): void;
}>();
const $q = useQuasar();
const graph = getGraph();
const graphBuilder = new GraphBuilder();
onMounted(() => {
  nextTick(async () => {
    try {
      await graphBuilder.build(props.initRecords, graph);
      await window.electronApi.persistentStore.setGraphBeforeUpsertion(
        graph.elements().jsons() as any
      ); //TODO store au moment de cliquer sur le bouton(on unmount ?) pour garder les positions des noeuds
      emit('allowNextStep');
      Log.stepInGreen('Fetching data successful');
      $q.notify({
        type: 'positive',
        message: 'All records fetched successfully !',
        multiLine: true,
        timeout: 2000,
        position: 'center',
        actions: [
          {
            label: 'Dismiss',
            color: 'white',
            handler: () => {
              /* ... */
            },
          },
        ],
      });
    } catch (error) {
      notifyError($q, errorMsgExtractor(error), error);
    }
  });
});
onUnmounted(() => {
  graphBuilder.processStopper.abort();
});
</script>

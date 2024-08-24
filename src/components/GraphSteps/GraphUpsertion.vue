<template>
  <GraphUi :graph="graph" ref="graphUi"></GraphUi>
</template>

<style></style>
<script lang="ts" setup>
import GraphUi from './GraphUi/GraphUi.vue';
import { errorMsg as errorMsgExtractor } from '../../../src-electron/utils';
import { useQuasar } from 'quasar';
import { isCytoNode, SdcData } from 'src/models/GraphTypes';
import { nextTick, onMounted, onUnmounted } from 'vue';
import { notifyError } from 'src/components/vueUtils';
import { getGraph } from './InitCytoscapeInstance';
import GraphUpserter from './GraphUpserter';
import { graphEmitter } from './GraphBuilder';

const graph = getGraph();
const $q = useQuasar();
const graphUpserter = new GraphUpserter(graph, $q);
onMounted(async () => {
  nextTick(async () => {
    try {
      const graphElements =
        await window.electronApi.persistentStore.getGraphBeforeUpsertion();
      if (graphElements) {
        graphElements.map((jsonNodeOrEdge) => {
          if (jsonNodeOrEdge.group === 'nodes') {
            jsonNodeOrEdge.data.sdcData = new SdcData(
              jsonNodeOrEdge.data.sdcData.sourceData,
              jsonNodeOrEdge.data.sdcData.targetData,
              jsonNodeOrEdge.data.sdcData.state,
              jsonNodeOrEdge.data.sdcData.isInitialRecord,
            );
          }
          return jsonNodeOrEdge;
        });
        graph.add(graphElements);
      }
      graphEmitter.emit('reload');
      await graphUpserter.init();
      $q.notify({
        type: 'positive',
        message: 'Every records inserted with success!',
        multiLine: true,
        timeout: 3000,
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
      const currentNode = graph
        .getElementById(graphUpserter.currentNodeId)
        .toArray()[0];
      if (isCytoNode(currentNode)) {
        graphUpserter.changeNodeState(currentNode, 'ERROR');
      }
      notifyError($q, errorMsgExtractor(error), error);
    }
  });
});
onUnmounted(() => {
  graphUpserter.processStopper.abort();
});
</script>

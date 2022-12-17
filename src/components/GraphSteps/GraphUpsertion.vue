<template>
  <GraphUi :graph="graph" ref="graphUi"></GraphUi>
</template>

<style></style>
<script lang="ts" setup>
import GraphUi from './GraphUi.vue';
import { errorMsg as errorMsgExtractor } from '../../../src-electron/utils';
import cytoscape from 'cytoscape';
import { useQuasar } from 'quasar';
import { isCytoNode, NodeData, NodeDataClass } from 'src/models/GraphTypes';
import { nextTick, onMounted, reactive, ref, watch } from 'vue';
import { notifyError } from '../vueUtils';
import { getGraph } from './InitCytoscapeInstance';
import { mapStateToClass } from './CytoscapeConf';
import GraphUpserter from './GraphUpserter';

const graph = getGraph();
const $q = useQuasar();
const graphUi = ref<InstanceType<typeof GraphUi> | null>(null);
onMounted(async () => {
  nextTick(async () => {
    const graphUpserter = new GraphUpserter(graph, $q);
    try {
      const graphElements =
        await window.electronApi.persistentStore.getGraphBeforeUpsertion();
      if (graphElements) {
        graphElements.map((jsonNodeOrEdge) => {
          if (jsonNodeOrEdge.group === 'nodes') {
            jsonNodeOrEdge.data.nodeData = new NodeDataClass(
              jsonNodeOrEdge.data.nodeData.sourceData,
              jsonNodeOrEdge.data.nodeData.targetData,
              jsonNodeOrEdge.data.nodeData.state,
              jsonNodeOrEdge.data.nodeData.isInitialRecord
            );
          }
          return jsonNodeOrEdge;
        });
        graph.add(graphElements);
      }
      setTimeout(() => {
        graphUi.value?.resetNodePosition();
      });
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
</script>

<template>
  <GraphUi :graph="graph" ref="graphUi"></GraphUi>
</template>

<style></style>
<script lang="ts" setup>
import GraphUi from './GraphUi.vue';
import { errorMsg as errorMsgExtractor } from '../../../src-electron/utils';
import cytoscape from 'cytoscape';
import { useQuasar } from 'quasar';
import { NodeData, NodeDataClass } from 'src/models/GraphTypes';
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
    try {
      const graphElements =
        await window.electronApi.persistentStore.getGraphBeforeUpsertion();
      if (graphElements) {
        graph.add(graphElements);
      }
      setTimeout(() => {
        graphUi.value?.resetNodePosition();
      });
      new GraphUpserter(graph, $q);
    } catch (error) {
      notifyError($q, errorMsgExtractor(error));
    }
  });
});
</script>

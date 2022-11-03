<template>
  <GraphUi v-if="graph.test" :graph="graph.test" ref="graphUi"></GraphUi>
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

const graph: { test?: cytoscape.Core<NodeData> } = reactive({});
const $q = useQuasar();
const graphUi = ref<InstanceType<typeof GraphUi> | null>(null);
onMounted(async () => {
  nextTick(async () => {
    try {
      const graphElements =
        await window.electronApi.persistentStore.getGraphBeforeUpsertion();
      graph.test = getGraph(graphElements);
      setTimeout(() => {
        graphUi.value?.resetNodePosition();
      });
    } catch (error) {
      notifyError($q, errorMsgExtractor(error));
    }
  });
});
</script>

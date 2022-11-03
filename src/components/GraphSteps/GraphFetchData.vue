<template>
  <GraphUi :graph="graph" ref="graphUi"></GraphUi>
</template>

<style>
#graph-layout.q-layout-container > div > div {
  overflow: hidden;
}
</style>
<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref } from 'vue';
import { errorMsg as errorMsgExtractor } from '../../../src-electron/utils';
import { useQuasar } from 'quasar';
import { GraphBuilder } from './GraphBuilder';
import { notifyError } from '../vueUtils';
import { isCytoNode, NodeData, NodeDataClass } from 'src/models/GraphTypes';
import { SfRecord } from 'src/models/types';
import { nodeStatesClasses, getGraph } from './InitCytoscapeInstance';
import GraphPanelContent from './GraphPanelContent.vue';
import GraphUi from './GraphUi.vue';

const props = defineProps<{ initRecords: SfRecord[] }>();
const emit = defineEmits<{
  (e: 'allowNextStep'): void;
}>();

const graphUi = ref<InstanceType<typeof GraphUi> | null>(null);

const $q = useQuasar();
const graph = getGraph();
onMounted(() => {
  nextTick(async () => {
    try {
      await new GraphBuilder().build(props.initRecords, graph);
      graphUi.value?.resetNodePosition();
      await window.electronApi.persistentStore.setGraphBeforeUpsertion(
        graph.elements().jsons() as any
      ); //TODO store au moment de cliquer sur le bouton pour garder les positions des noeuds
      emit('allowNextStep');
    } catch (error) {
      notifyError($q, errorMsgExtractor(error));
    }
  });
});
</script>

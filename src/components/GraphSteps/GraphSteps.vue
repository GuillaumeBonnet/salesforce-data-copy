<template>
  tee steps
  <div class="relative">
    <div
      id="graph"
      ref="graph"
      class="h-96 border-4 border-black bg-gray-100"
    ></div>
    <q-btn
      class="absolute top-4 right-4"
      color="secondary"
      label="Reset nodes positions"
      @click="resetNodePosition()"
    />
  </div>
</template>

<style></style>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import cytoscape, {
  CollectionReturnValue,
  Core,
  ElementDefinition,
  NodeSingular,
} from 'cytoscape';
import { errorMsg as errorMsgExtractor } from '../../../src-electron/utils';
import { useQuasar } from 'quasar';
import { GraphBuilder } from './GraphBuilder';
import { notifyError } from '../vueUtils';
import { NodeData } from 'src/models/GraphTypes';
import { SfRecord } from 'src/models/types';
import { getEmptyGraph } from './InitCytoscapeInstance';

const props = defineProps<{ initRecords: SfRecord[] }>();
const $q = useQuasar();
const cy = getEmptyGraph();

onMounted(() => {
  const graphNode = document.getElementById('graph');
  if (!graphNode) {
    throw Error('Node for graph not found.');
  }
  cy.mount(graphNode);
  nextTick(async () => {
    try {
      await new GraphBuilder().build(props.initRecords, cy);
      resetNodePosition();
    } catch (error) {
      notifyError($q, errorMsgExtractor(error));
    }
  });
});

const resetNodePosition = () => {
  cy.layout({
    name: 'dagre',
  }).run();
};
</script>

<template>
  tee steps
  <div class="bg-red-600" v-if="errorMsg">{{ errorMsg }}</div>
  <div id="graph" ref="graph" class="h-96 border border-black bg-white"></div>
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
import { Record } from 'jsforce';
import { GraphBuilder } from './GraphBuilder';
import { notifyError } from '../vueUtils';

const props = defineProps<{ initRecords: Record[] }>();
const errorMsg = ref('');
const $q = useQuasar();

onMounted(() => {
  const cy = cytoscape({
    container: document.getElementById('graph'), // container to render in

    elements: [
      // list of graph elements to start with
      {
        // node a
        data: { id: 'a' },
      },
      {
        // node b
        data: { id: 'b' },
      },
      {
        // edge ab
        data: { id: 'ab', source: 'a', target: 'b' },
      },
    ],

    style: [
      // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          label: 'data(id)',
        },
      },

      {
        selector: 'edge',
        style: {
          width: 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
        },
      },
    ],

    layout: {
      name: 'grid',
      rows: 1,
    },
  });
  nextTick(async () => {
    try {
      await new GraphBuilder().build(props.initRecords);
    } catch (error) {
      notifyError($q, errorMsgExtractor(error));
    }
  });
  setTimeout(() => {
    cy.add([
      {
        group: 'nodes',
        data: {
          id: 'c',
        },
      },
      {
        group: 'edges',
        data: {
          id: 'c' + '-edge',
          source: 'a',
          target: 'c',
        },
      },
    ]);
  }, 1000);
});
</script>

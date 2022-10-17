<template>
  tee steps
  <div id="graph" ref="graph" class="h-96 border border-black bg-white"></div>
</template>

<style></style>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import cytoscape, {
  CollectionReturnValue,
  Core,
  ElementDefinition,
  NodeSingular,
} from 'cytoscape';

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
});
</script>

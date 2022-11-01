<template>
  <q-layout
    view="hHh lpR fFf"
    container
    class="rounded-md h-96 border-2 border-black"
    id="graph-layout"
  >
    <q-drawer
      v-model="panel.isOpened"
      behavior="default"
      overlay
      bordered
      class="bg-gray-600"
      :width="600"
      :mini-width="300"
    >
      <q-scroll-area class="h-full">
        <GraphPanelContent
          :node-selected="panel.selectedNode"
          v-if="panel.selectedNode"
          @close-panel="panel.isOpened = false"
        ></GraphPanelContent>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="flex flex-col">
      <q-page class="flex flex-col">
        <div class="relative flex-grow flex flex-col">
          <div id="graph" ref="graph" class="bg-gray-100 flex-grow"></div>
          <q-btn
            class="absolute top-4 right-4"
            color="secondary"
            label="Reset nodes positions"
            @click="resetNodePosition()"
          />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style>
#graph-layout.q-layout-container > div > div {
  overflow: hidden;
}
</style>
<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref } from 'vue';
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
import { isCytoNode, NodeData, NodeDataClass } from 'src/models/GraphTypes';
import { SfRecord } from 'src/models/types';
import { getEmptyGraph, nodeStatesClasses } from './InitCytoscapeInstance';
import GraphPanelContent from './GraphPanelContent.vue';
import { Duration } from '@salesforce/kit';

const props = defineProps<{ initRecords: SfRecord[] }>();
const $q = useQuasar();
const graph = getEmptyGraph();
const panel = reactive<{ isOpened: boolean; selectedNode?: NodeDataClass }>({
  isOpened: false,
  selectedNode: undefined,
});

onMounted(() => {
  const graphNode = document.getElementById('graph');
  if (!graphNode) {
    throw Error('Node for graph not found.');
  }
  graph.mount(graphNode);
  graph.on('tap', function (event) {
    // target holds a reference to the originator
    // of the event (core or element)
    const evtTarget = event.target;
    const resetNodeAnimation = () => {
      if (panel.selectedNode) {
        const cyNode = graph.$id(panel.selectedNode.sourceId);
        cyNode.stop();
        cyNode.style('width', 30);
        cyNode.style('height', 30);
      }
    };
    if (evtTarget === graph) {
      panel.isOpened = false;
      resetNodeAnimation();
      panel.selectedNode = undefined;
    } else if (evtTarget) {
      if (!isCytoNode(evtTarget)) {
        return;
      }
      panel.isOpened = true;
      resetNodeAnimation();
      panel.selectedNode = evtTarget.data().nodeData;
      const pulseIfSelected = () => {
        panel.selectedNode;
        if (evtTarget.id() != panel.selectedNode?.sourceId) {
          return;
        }
        const shiftVal = 4;
        evtTarget.animate({
          style: { width: 32, height: 32 },
          position: {
            x: evtTarget.position().x,
            y: evtTarget.position().y - shiftVal,
          },
          easing: 'ease-in',
          duration: 1100,
          complete: () => {
            evtTarget.animate({
              style: { width: 30, height: 30 },
              position: {
                x: evtTarget.position().x,
                y: evtTarget.position().y + shiftVal,
              },
              easing: 'ease',
              duration: 1100,
              complete: pulseIfSelected,
            });
          },
        });
      };
      pulseIfSelected();
    }
  });
  nextTick(async () => {
    try {
      await new GraphBuilder().build(props.initRecords, graph);
      resetNodePosition();
    } catch (error) {
      notifyError($q, errorMsgExtractor(error));
    }
  });
});

const resetNodePosition = () => {
  graph
    .layout({
      name: 'dagre',
    })
    .run();
};
</script>

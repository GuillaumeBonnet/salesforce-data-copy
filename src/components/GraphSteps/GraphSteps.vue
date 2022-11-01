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

<style></style>

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
import { getEmptyGraph } from './InitCytoscapeInstance';
import GraphPanelContent from './GraphPanelContent.vue';

const props = defineProps<{ initRecords: SfRecord[] }>();
const $q = useQuasar();
const cy = getEmptyGraph();
const panel = reactive<{ isOpened: boolean; selectedNode?: NodeDataClass }>({
  isOpened: false,
  selectedNode: undefined,
});

onMounted(() => {
  const graphNode = document.getElementById('graph');
  if (!graphNode) {
    throw Error('Node for graph not found.');
  }
  cy.mount(graphNode);
  cy.on('tap', function (event) {
    // target holds a reference to the originator
    // of the event (core or element)
    var evtTarget = event.target;

    if (evtTarget === cy) {
      console.log('tap on background');
      panel.isOpened = false;
    } else if (evtTarget) {
      if (!isCytoNode(evtTarget)) {
        return;
      }

      evtTarget.data().nodeData;
      //TODO fn type narrow Node
      // change class currently selected node;
      // ouvrir un pannel avec les data du selected node
      console.log('tap on some element');
      console.log('gboDebug: type', evtTarget.isNode());
      console.log(
        'gboDebug:[evtTarget.data().nodeData]',
        evtTarget.data().nodeData
      );
      panel.selectedNode = evtTarget.data().nodeData;
      panel.isOpened = true;
    }
  });
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

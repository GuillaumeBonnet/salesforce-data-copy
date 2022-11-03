<template>
  <q-layout
    view="hHh lpR fFf"
    container
    class="rounded-md h-96 border-2 border-black"
    id="graph-layout"
  >
    <q-drawer
      v-model="panel.isOpened"
      behavior="desktop"
      overlay
      bordered
      class="bg-gray-600"
      :width="600"
      :mini-width="300"
      @hide="
        resetNodeAnimation(panel.selectedNode);
        panel.selectedNode = undefined;
      "
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
          <div ref="graphNode" class="bg-gray-100 flex-grow"></div>
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
import { nextTick, onMounted, reactive, ref, watch, onUnmounted } from 'vue';
import { errorMsg as errorMsgExtractor } from '../../../src-electron/utils';
import { useQuasar } from 'quasar';
import { GraphBuilder } from './GraphBuilder';
import { notifyError } from '../vueUtils';
import { isCytoNode, NodeData, NodeDataClass } from 'src/models/GraphTypes';
import { SfRecord } from 'src/models/types';
import { nodeStatesClasses } from './InitCytoscapeInstance';
import GraphPanelContent from './GraphPanelContent.vue';

const graphNode = ref(null);

const props = defineProps<{ graph: cytoscape.Core<NodeData> }>();

const $q = useQuasar();
const panel = reactive<{ isOpened: boolean; selectedNode?: NodeDataClass }>({
  isOpened: false,
  selectedNode: undefined,
});

onMounted(() => {
  if (!graphNode.value) {
    throw Error('Node for graph not found.');
  }
  props.graph.mount(graphNode.value);
  props.graph.on('tap', function (event) {
    // target holds a reference to the originator
    // of the event (core or element)
    const evtTarget = event.target;
    if (evtTarget === props.graph) {
      panel.isOpened = false;
      resetNodeAnimation(panel.selectedNode);
      panel.selectedNode = undefined;
    } else if (evtTarget) {
      if (!isCytoNode(evtTarget)) {
        return;
      }
      panel.isOpened = true;
      resetNodeAnimation(panel.selectedNode);
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
});

const resetNodePosition = () => {
  props.graph
    .layout({
      name: 'dagre',
    })
    .run();
};
const resetNodeAnimation = (node?: NodeDataClass) => {
  if (node) {
    const cyNode = props.graph.$id(node.sourceId);
    cyNode.stop();
    cyNode.style('width', 30);
    cyNode.style('height', 30);
  }
};

onUnmounted(() => {
  props.graph.destroy();
});

defineExpose({
  resetNodePosition,
});
</script>

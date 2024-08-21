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
          <div ref="graphHtmlNode" class="bg-gray-100 flex-grow"></div>
          <q-btn
            class="absolute top-2 right-2"
            color="secondary"
            label="Reset nodes positions"
            @click="resetNodePosition(true)"
          />
          <SettingsMenu
            class="absolute top-2 left-2"
            v-model:spacingFactor="spacingFactor"
            v-model:areOwnersHidden="areOwnersHidden"
            v-model:zoomLevel="zoomLevel"
          ></SettingsMenu>
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
import { onMounted, reactive, ref, onUnmounted } from 'vue';
import { isCytoNode, NodeData, NodeDataClass } from 'src/models/GraphTypes';
import GraphPanelContent from './GraphPanelContent.vue';
import { watch } from 'vue';
import { MAIN_LAYOUT } from '../CytoscapeConf';
import { graphEmitter } from '../GraphBuilder';
import SettingsMenu from './SettingsMenu.vue';
import cytoscape from 'cytoscape';

const props = defineProps<{
  graph: cytoscape.Core<NodeData>;
}>();

const zoomLevel = ref(1);
const spacingFactor = ref(1.5); //value overriden by default value of persistentStore
const areOwnersHidden = ref(false);

const graphHtmlNode = ref(null);

const panel = reactive<{ isOpened: boolean; selectedNode?: NodeDataClass }>({
  isOpened: false,
  selectedNode: undefined,
});

onMounted(async () => {
  if (!graphHtmlNode.value) {
    throw Error('Html Node for graph not found.');
  }
  props.graph.mount(graphHtmlNode.value);
  const graphUiSettings =
    await window.electronApi.persistentStore.getGraphUiSettings();
  spacingFactor.value = graphUiSettings.spacingFactor;
  areOwnersHidden.value = graphUiSettings.areOwnersHidden;
  graphEmitter.on('reload', () => {
    resetNodePosition(false);
  });
  props.graph.on('zoom', function () {
    zoomLevel.value = props.graph.zoom();
  });
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

watch(
  spacingFactor,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (value, oldValue) => {
    resetNodePosition(false);
  },
);
watch(
  zoomLevel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (value, oldValue) => {
    props.graph.zoom(value);
  },
);
watch(
  areOwnersHidden,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (value, oldValue) => {
    toggleSecondaryNodesVisibility();
  },
);
const resetNodePosition = (isFromButton: boolean) => {
  props.graph
    .layout({
      ...MAIN_LAYOUT,
      spacingFactor: spacingFactor.value,
      zoom: isFromButton ? null : zoomLevel.value,
    })
    .run();
  setTimeout(() => {
    toggleSecondaryNodesVisibility();
  });
};
const resetNodeAnimation = (node?: NodeDataClass) => {
  if (node) {
    const cyNode = props.graph.$id(node.sourceId);
    cyNode.stop();
    cyNode.style('width', 30);
    cyNode.style('height', 30);
  }
};

const toggleSecondaryNodesVisibility = () => {
  if (areOwnersHidden.value) {
    props.graph
      .elements()
      .filter((element) => {
        if (
          element.isNode() &&
          element.data().label.startsWith('[RecordType]')
        ) {
          return true;
        }
        if (element.isNode() && element.data().label.startsWith('[User]')) {
          const childrenEdges = props.graph.edges(
            `edge[target="${element.id()}"]`,
          );
          const hasOnlyOwnerEdges = childrenEdges.every((elem) => {
            return elem.data().label == 'OwnerId';
          });
          if (hasOnlyOwnerEdges) {
            return true;
          }
        }
        if (
          element.isEdge() &&
          (element.data().label == 'OwnerId' ||
            element.data().label == 'RecordTypeId')
        ) {
          // we also need to hide OwnerId edges for the Users who are
          // pointed by UserLookups other than OwnerId edges
          return true;
        }
        return false;
      })
      .style({
        visibility: 'hidden',
      });
  } else {
    props.graph
      .filter((element) => {
        return element.style('visibility') == 'hidden';
      })
      .style({
        visibility: 'visible',
      });
  }
};

onUnmounted(() => {
  window.electronApi.persistentStore.setGraphUiSettings({
    spacingFactor: spacingFactor.value,
    areOwnersHidden: areOwnersHidden.value,
  });
  // destroying graph here causes internal error withing cytoscape
});
</script>

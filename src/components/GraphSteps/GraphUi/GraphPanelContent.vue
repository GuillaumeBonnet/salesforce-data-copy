<template>
  <div class="flex flex-col h-full flex-nowrap">
    <div class="flex justify-end">
      <QBtn
        class=""
        icon="close"
        flat
        round
        @click="$emit('closePanel')"
      ></QBtn>
    </div>
    <div class="p-4 pt-0 flex-grow flex flex-col">
      <div class="" v-if="!nodeSelected">No node selected</div>
      <template v-if="nodeSelected">
        <div class="underline text-center font-semibold text-lg mb-2">
          {{ nodeSelected.label }}
        </div>
        <div class="flex justify-between">
          <div class="flex gap-1">
            <div class="underline">State:</div>
            <span class="">{{ nodeSelected.state }}</span>
            <span class="w-4 h-4 rounded-full" :style="nodeStyle"></span>
            <span v-if="nodeSelected.isInitialRecord">(Initial record)</span>
          </div>
        </div>
        <div class="flex-grow">
          <q-table
            style=""
            class="my-sticky-header-table my-3 h-full"
            :rows="rows"
            :columns="columns"
            row-key="fieldName"
            dark
            color="amber"
            dense
            wrap-cells
            :pagination="{ rowsPerPage: 0 }"
            virtual-scroll
            hide-bottom
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="sass">
.my-sticky-header-table

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #1b1b1b

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
<script lang="ts" setup>
import { computed } from 'vue';
import { SdcData } from 'src/models/GraphTypes';
import { QTableProps } from 'quasar';
import { CYTOSCAPE_STYLESHEETS, mapStateToClass } from '../CytoscapeConf';
import { StylesheetCSS } from 'cytoscape';

const props = defineProps<{ nodeSelected: SdcData }>();
defineEmits<{
  (e: 'closePanel'): void;
}>();

const columns: NonNullable<QTableProps['columns']> = [
  {
    name: 'field',
    required: true,
    label: 'Field',
    align: 'left',
    field: 'fieldName',
    sortable: true,
  },
  {
    name: 'fromValue',
    align: 'left',
    label: 'value(from sandbox)',
    field: 'fromValue',
  },
  {
    name: 'toValue',
    align: 'left',
    label: 'value(to sandbox)',
    field: 'toValue',
  },
];

const rows = computed(() => {
  const returnRows = [];
  for (const fieldName in props.nodeSelected.sourceData) {
    if (fieldName == 'attributes') {
      continue;
    }
    if (props.nodeSelected.sourceData[fieldName]) {
      returnRows.push({
        fieldName,
        fromValue: props.nodeSelected.sourceData[fieldName],
        toValue: props.nodeSelected.targetData[fieldName],
      });
    }
  }
  return returnRows;
});
const mapStylesheet: { [selector: string]: StylesheetCSS['css'] } = {};
for (const stylesheet of CYTOSCAPE_STYLESHEETS) {
  if (!stylesheet || !('style' in stylesheet)) {
    continue;
  }
  mapStylesheet[stylesheet.selector] = stylesheet.style;
}
const nodeStyle = computed(() => {
  const nodeStylesheet = Object.assign({}, mapStylesheet['node']);
  if (!nodeStylesheet) {
    return null;
  }
  const currentStateStyle =
    mapStylesheet['.' + mapStateToClass[props.nodeSelected.state]];
  if (currentStateStyle) {
    Object.assign(nodeStylesheet, currentStateStyle);
  }
  if (props.nodeSelected.isInitialRecord) {
    const initRecordStyle = mapStylesheet['.' + mapStateToClass.INITIAL_RECORD];
    if (initRecordStyle) {
      Object.assign(nodeStylesheet, initRecordStyle);
    }
  }
  return nodeStylesheet;
});
</script>

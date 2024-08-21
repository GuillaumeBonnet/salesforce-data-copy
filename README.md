# salesforce data copy (salesforce-data-copy)

# Install the dependencies

```bash
yarn
# or
npm install
```

## Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

## Build the app for production

```bash
quasar build
```

# patch-package for cytoscape-patch

A package-patch is applied after installation to change the file [/node_modules/@types/cytoscape/index.d.ts](/node_modules/@types/cytoscape/index.d.ts) in order to have a better autocompletion of the custom data stored in the graph nodes.

## example

graphType: `cytoscape.Core<NodeData>` where `NodeData` is the generic type we expect to have when we access the data such as with `node.data(): NodeData`.

# Information for updating dependencies:

- chalk can't be in version 5 with typescript or a build tool

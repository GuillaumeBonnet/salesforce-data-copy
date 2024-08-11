<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-center">
          Salesforce Data Copy
        </q-toolbar-title>
        <div>v {{ packageInfo.version }}</div>
      </q-toolbar>
    </q-header>
    <q-page-container class="h-full">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import packageInfo from '@root/package.json';
</script>

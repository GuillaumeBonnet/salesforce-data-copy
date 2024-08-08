<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-center">
          Salesforce Data Copy
        </q-toolbar-title>

        <div>v {{ '00' }}</div>
        <!-- //TODO ask node for the package.json version -->
      </q-toolbar>
    </q-header>
    <q-page-container class="h-full">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>

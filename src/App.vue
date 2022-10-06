<template>
  <router-view />
</template>

<script setup lang="ts">
import { Quasar } from 'quasar';
import { getCurrentInstance } from 'vue';

getCurrentInstance()?.appContext.app.use(Quasar, {
  config: {
    brand: {
      primary: '#26395c',
      secondary: '#26A69A',
      accent: '#9C27B0',

      dark: '#1d1d1d',
      'dark-page': '#121212',

      positive: '#21BA45',
      negative: '#C10015',
      info: '#31CCEC',
      warning: '#F2C037',
    },
  },
});
</script>

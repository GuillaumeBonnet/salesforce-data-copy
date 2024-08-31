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
    <q-footer class="bg-grey-9 px-10 py-2" elevated>
      <div class="flex justify-around">
        <q-btn
          flat
          color="grey-5"
          label="Licensing Information"
          size="small"
          @click="licensingDialog()"
        />
        <q-btn
          flat
          color="grey-5"
          label="Repository"
          size="small"
          icon="fab fa-github"
          @click="openRepos()"
        />
        <q-btn
          flat
          color="grey-5"
          label="Privacy Policy"
          size="small"
          @click="privacyDialog()"
        />
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import packageInfo from '@root/package.json';
import { useQuasar } from 'quasar';
import LicensingInformation from '../components/LicensingInformation.vue';
import PrivacyPolicy from '../components/PrivacyPolicy.vue';
const $q = useQuasar();
const licensingDialog = () => {
  $q.dialog({
    component: LicensingInformation,
  });
};

const privacyDialog = () => {
  $q.dialog({
    component: PrivacyPolicy,
  });
};
const openRepos = () => {
  window.electronApi.other.openLink(
    'https://github.com/GuillaumeBonnet/salesforce-data-copy',
  );
};
</script>

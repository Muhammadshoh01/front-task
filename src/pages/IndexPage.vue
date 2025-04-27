<template>
  <div>
    <div class="q-gutter-y-md">
      <q-card>
        <q-tabs v-model="activeTab" class="bg-primary text-white" align="justify" narrow-indicator>
          <q-tab name="posts" label="Posts" />
          <q-tab name="photos" label="Photos" />
          <q-tab name="todos" label="Todos" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="posts" class="bg-blue-1 text-dark text-center">
            <PostTable />
          </q-tab-panel>

          <q-tab-panel name="photos" class="bg-cyan-1 text-dark text-center">
            <AlbumTable />
          </q-tab-panel>

          <q-tab-panel name="todos" class="bg-green-1 text-dark text-center">
            <TodosPage />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import PostTable from 'src/components/PostTable.vue';
import AlbumTable from 'src/components/AlbumTable.vue';
import TodosPage from './TodosPage.vue';

const tabs = ['posts', 'photos', 'todos'];
const activeTab = ref(localStorage.getItem('activeTab') || tabs[0]);

watch(activeTab, (newTab): void => {
  if (newTab) {
    localStorage.setItem('activeTab', newTab);
  }
});
</script>

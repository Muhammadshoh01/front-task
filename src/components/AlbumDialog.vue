<template>
  <q-dialog v-model="isAlbumDialogOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit Album' : 'Create New Album' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-form @submit="saveAlbum" ref="albumData">
          <div class="q-col-gutter-md">
            <q-input
              v-model="albumForm.title"
              label="Title"
              outlined
              :rules="[(val) => !!val || 'Title is required']"
              stack-label
            />
            <q-select
              v-model="albumForm.userId"
              label="User"
              :options="users.map((u) => ({ label: u.name, value: u.id }))"
              :rules="[(val) => !!val || 'User is required']"
              emit-value
              map-options
              outlined
              stack-label
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn flat label="Save" color="primary" @click="saveAlbum" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAlbumStore } from 'src/stores/album-store';
// import type { Album } from 'src/types';

const albumStore = useAlbumStore();
const albumData = ref(null);
const isEditing = ref(false);
const isAlbumDialogOpen = ref(false);
const albumForm = ref({
  id: null,
  title: '',
  userId: null,
});
const users = computed(() => {
  return albumStore.users;
});

function openCreateAlbumDialog() {
  isEditing.value = false;
  albumForm.value = {
    id: null,
    title: '',
    userId: null,
  };
  isAlbumDialogOpen.value = true;
}
function openEditAlbumDialog(album) {
  isEditing.value = true;
  albumForm.value = { ...album };
  isAlbumDialogOpen.value = true;
}

async function saveAlbum() {
  const success = await albumData.value.validate();
  if (success) {
    if (isEditing.value) {
      await albumStore.editAlbum(albumForm.value);
    } else {
      await albumStore.addAlbum(albumForm.value);
    }
  } else {
    throw Error('Please enter valid data');
  }
  isAlbumDialogOpen.value = false;
}

defineExpose({ isAlbumDialogOpen, openCreateAlbumDialog, openEditAlbumDialog });
</script>

<style></style>

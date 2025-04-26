<template>
  <div class="q-gutter-md q-pa-md">
    <q-card v-for="photo in photos" :key="photo.id" @click="openPhoto(photo)" class="my-photo-card">
      <q-img :src="photo.thumbnailUrl" :alt="photo.title" />
      <div class="q-pt-sm q-px-sm">{{ photo.title }}</div>
    </q-card>

    <!-- Photo Modal -->
    <q-dialog v-model="isDialogOpen">
      <q-card class="q-pa-md">
        <q-btn flat round icon="close" v-close-popup class="absolute-top-right" />
        <q-img
          :src="selectedPhoto.url"
          :alt="selectedPhoto.title"
          style="max-width: 90vw; max-height: 80vh"
        />
        <div class="q-mt-md text-center">{{ selectedPhoto.title }}</div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const albumId = route.query.albumId;
const photos = ref([]);
const isDialogOpen = ref(false);
const selectedPhoto = ref({});

onMounted(async () => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/photos?albumId=${albumId}`);
  photos.value = await response.json();
});

function openPhoto(photo) {
  selectedPhoto.value = photo;
  isDialogOpen.value = true;
}
</script>

<style scoped>
.my-photo-card {
  width: 150px;
  cursor: pointer;
  transition: transform 0.2s;
}
.my-photo-card:hover {
  transform: scale(1.05);
}
.q-gutter-md {
  display: flex;
  flex-wrap: wrap;
}
</style>

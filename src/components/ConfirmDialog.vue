<template>
  <!-- Confirm Delete Dialog -->
  <q-dialog v-model="confirmBulkDelete">
    <q-card class="confirm-delete-card">
      <q-card-section class="row items-center justify-center">
        <q-avatar icon="warning" color="negative" text-color="white" />
        <span class="q-ml-sm text-h6">Confirm Delete</span>
      </q-card-section>

      <q-card-section align="center">
        Are you sure you want to delete {{ props.selected.length }}
        {{ props.type == 'post' ? 'post(s)' : 'album(s)' }}?
      </q-card-section>

      <q-card-actions align="center">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Delete" color="negative" @click="bulkDelete" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Confirm Favorite Dialog -->
  <q-dialog v-model="confirmBulkFavorite">
    <q-card class="confirm-delete-card">
      <q-card-section class="row items-center justify-center">
        <q-avatar icon="info" color="positive" text-color="white" />
        <span class="q-ml-sm text-h6">Confirm Add to Favorites</span>
      </q-card-section>

      <q-card-section align="center">
        Are you sure you want to add {{ props.selected.length }}
        {{ props.type == 'post' ? 'post(s)' : 'album(s)' }} to favorites?
      </q-card-section>

      <q-card-actions align="center">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Confirm" color="positive" @click="bulkFavorite" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="confirmDeleteDialog" persistent>
    <q-card class="confirm-delete-card">
      <q-card-section class="row items-center justify-center">
        <q-avatar icon="warning" color="negative" text-color="white" />
        <span class="q-ml-sm text-h6">Delete {{ props.type == 'post' ? 'Post' : 'Album' }}</span>
      </q-card-section>
      <q-card-section align="center">
        Are you sure you want to delete this {{ props.type == 'post' ? 'post' : 'album' }}? This
        action cannot be undone.
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn
          flat
          label="Delete"
          color="negative"
          v-if="props.type == 'post'"
          @click="selectedPostId !== undefined && deletePost(selectedPostId)"
          v-close-popup
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          v-if="props.type == 'album'"
          @click="selectedAlbumId !== undefined && deleteAlbum(selectedAlbumId)"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { usePostsStore } from 'src/stores/post-store';
import { useAlbumStore } from 'src/stores/album-store';
import type { Post } from 'src/types';

const $q = useQuasar();

const postStore = usePostsStore();
const albumStore = useAlbumStore();
const emit = defineEmits(['clear-selected']);
const props = defineProps({
  selected: {
    type: Array as () => Post[],
    required: true,
  },
  selectedPostId: {
    type: Number,
    required: false,
  },
  selectedAlbumId: {
    type: Number,
    required: false,
  },
  type: {
    type: String,
    required: false,
  },
});

const confirmBulkDelete = ref(false);
const confirmBulkFavorite = ref(false);
const confirmDeleteDialog = ref(false);

const bulkDelete = () => {
  if (props.type == 'post') {
    props.selected.forEach((post: Post) => {
      postStore.deletePost(post.id);
    });
  }
  if (props.type == 'album') {
    props.selected.forEach((album) => {
      albumStore.deleteAlbum(album.id);
    });
  }
  emit('clear-selected');
  confirmBulkDelete.value = false;
  $q.notify({
    type: 'negative',
    message: `Deleted selected ${props.type == 'post' ? 'posts' : 'albums'}.`,
  });
};

const bulkFavorite = () => {
  if (props.type == 'post') {
    props.selected.forEach((post) => {
      if (!post.isFavorite) {
        postStore.toggleFavorite(post.id);
      }
    });
  }
  if (props.type == 'album') {
    props.selected.forEach((album) => {
      if (!album.isFavorite) {
        albumStore.toggleFavorite(album.id);
      }
    });
  }
  emit('clear-selected');
  confirmBulkFavorite.value = false;
  $q.notify({
    type: 'positive',
    message: `Added selected ${props.type == 'post' ? 'Post' : 'Album'} to favorites.`,
  });
};

const deletePost = async (postId: number) => {
  await postStore.deletePost(postId);
  $q.notify({ type: 'negative', message: 'Selected post deleted.' });
};
const deleteAlbum = async (albumId: number) => {
  await albumStore.deleteAlbum(albumId);
  $q.notify({ type: 'negative', message: 'Selected album deleted.' });
};

defineExpose({ confirmDeleteDialog, confirmBulkFavorite, confirmBulkDelete });
</script>

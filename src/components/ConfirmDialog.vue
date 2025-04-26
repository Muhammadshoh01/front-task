<template>
  <!-- Confirm Delete Dialog -->
  <q-dialog v-model="confirmBulkDelete">
    <q-card class="confirm-delete-card">
      <q-card-section class="row items-center justify-center">
        <q-avatar icon="warning" color="negative" text-color="white" />
        <span class="q-ml-sm text-h6">Confirm Delete</span>
      </q-card-section>

      <q-card-section align="center">
        Are you sure you want to delete {{ props.selected.length }} post(s)?
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
        Are you sure you want to add {{ props.selected.length }} post(s) to favorites?
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
        <span class="q-ml-sm text-h6">Delete Post</span>
      </q-card-section>
      <q-card-section align="center">
        Are you sure you want to delete this post? This action cannot be undone.
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="deletePost(selectedPostId)"
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

const $q = useQuasar();

const postStore = usePostsStore();
const emit = defineEmits(['clear-selected']);
const props = defineProps({
  selected: {
    type: Array,
    required: true,
  },
  selectedPostId: {
    type: Number,
    required: false,
  },
});

const confirmBulkDelete = ref(false);
const confirmBulkFavorite = ref(false);
const confirmDeleteDialog = ref(false);

const bulkDelete = () => {
  props.selected.forEach((post) => {
    postStore.deletePost(post.id);
  });
  emit('clear-selected'); //
  confirmBulkDelete.value = false;
  $q.notify({ type: 'negative', message: 'Deleted selected posts.' });
};

const bulkFavorite = () => {
  props.selected.forEach((post) => {
    if (!post.isFavorite) {
      postStore.toggleFavorite(post.id);
    }
  });
  emit('clear-selected'); //
  confirmBulkFavorite.value = false;
  $q.notify({ type: 'positive', message: 'Added selected posts to favorites.' });
};

const deletePost = async (postId: number) => {
  await postStore.deletePost(postId);
  $q.notify({ type: 'negative', message: 'Selected post deleted.' });
};

defineExpose({ confirmDeleteDialog, confirmBulkFavorite, confirmBulkDelete });
</script>

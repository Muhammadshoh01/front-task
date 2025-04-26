<template>
  <q-dialog v-model="isPostDialogOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit Post' : 'Create New Post' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-form @submit="savePost" ref="postData">
          <div class="q-col-gutter-md">
            <q-input
              v-model="postForm.title"
              label="Title"
              outlined
              :rules="[(val) => !!val || 'Title is required']"
              stack-label
            />
            <q-input
              v-model="postForm.body"
              label="Body"
              type="textarea"
              outlined
              stack-label
              :rules="[(val) => !!val || 'Body is required']"
            />
            <q-select
              v-model="postForm.userId"
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
        <q-btn flat label="Save" color="primary" @click="savePost" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePostsStore } from 'src/stores/post-store';

const postStore = usePostsStore();
const postData = ref(null);
const isEditing = ref(false);
const isPostDialogOpen = ref(false);
const postForm = ref({
  id: null,
  title: '',
  body: '',
  userId: null,
});
const users = computed(() => {
  return postStore.users;
});

function openCreatePostDialog() {
  isEditing.value = false;
  postForm.value = {
    id: null,
    title: '',
    body: '',
    userId: null,
  };
  isPostDialogOpen.value = true;
}
function openEditPostDialog(post) {
  isEditing.value = true;
  postForm.value = { ...post };
  isPostDialogOpen.value = true;
}

async function savePost() {
  const success = await postData.value.validate();
  if (success) {
    if (isEditing.value) {
      await postStore.editPost(postForm.value);
    } else {
      await postStore.addPost(postForm.value);
    }
  } else {
    throw Error('Please enter valid data');
  }
  isPostDialogOpen.value = false;
}

defineExpose({ isPostDialogOpen, openCreatePostDialog, openEditPostDialog });
</script>

<style></style>

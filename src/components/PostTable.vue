<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h4 text-md-h6 text-sm-body1 text-weight-bold text-primary main-header">
            Post Management
          </div>
          <q-btn
            label="Add New Post"
            color="primary"
            @click="postDialogRef.openCreatePostDialog()"
            class="q-px-md"
            icon="add"
            unelevated
            rounded
          />
        </div>
        <q-card flat bordered>
          <q-table
            title="Posts"
            :rows="filteredPosts"
            :columns="columns"
            row-key="id"
            class="post-table"
            selection="multiple"
            v-model:selected="selected"
            v-model:pagination="pagination"
            :expandable-rows="true"
            :filter="filter"
          >
            <template v-slot:top>
              <div class="row full-width items-center q-pa-md">
                <div class="text-h6 text-weight-medium">All Posts</div>
                <q-space />
                <div v-if="selected.length > 0">
                  <q-btn
                    color="negative"
                    label="Delete Selected"
                    @click="confirmDialogRef.confirmBulkDelete = true"
                  />
                  <q-btn
                    color="positive"
                    label="Add Selected to Favorites"
                    class="q-ml-md"
                    @click="confirmDialogRef.confirmBulkFavorite = true"
                    :disable="!selected.length"
                  />
                </div>
                <!-- Title Search -->
                <q-input
                  v-model="titleFilter"
                  dense
                  placeholder="Search Title"
                  outlined
                  clearable
                  class="q-ml-md"
                >
                  <template v-slot:append>
                    <q-icon name="search" color="primary" />
                  </template>
                </q-input>

                <!-- Username Multi-Select -->
                <q-select
                  style="width: 200px"
                  v-model="usernameFilter"
                  multiple
                  dense
                  options-dense
                  clearable
                  outlined
                  class="q-ml-md"
                  :options="usernameOptions"
                  label="Filter by Username"
                  option-label="label"
                  option-value="value"
                  map-options
                  emit-value
                  @clear="usernameFilter = []"
                />

                <!-- Favorite Status Select -->
                <q-select
                  style="width: 200px"
                  v-model="favoriteFilter"
                  dense
                  clearable
                  outlined
                  class="q-ml-md"
                  :options="[
                    { label: 'All', value: 'all' },
                    { label: 'Favorites', value: 'favorites' },
                    { label: 'Not Favorites', value: 'notFavorites' },
                  ]"
                  label="Favorite Status"
                  option-label="label"
                  option-value="value"
                  map-options
                  emit-value
                />
              </div>
            </template>

            <!-- Title Column -->
            <template #body-cell-title="props">
              <q-td :props="props" class="text-wrap text-left">
                {{ props.row.title }}
              </q-td>
            </template>

            <!-- Actions Column -->
            <template #body-cell-actions="props">
              <q-td :props="props" class="q-gutter-sm">
                <!-- <q-btn
                  flat
                  round
                  icon="comment"
                  size="sm"
                  @click="toggleComments(props)"
                  :color="props.expand ? 'primary' : 'grey'"
                >
                  <q-tooltip>
                    {{ props.expand ? 'Hide Comments' : 'Show Comments' }}
                  </q-tooltip>
                </q-btn> -->
                <q-btn
                  flat
                  round
                  icon="edit"
                  size="sm"
                  color="primary"
                  @click="postDialogRef.openEditPostDialog(props.row)"
                >
                  <q-tooltip>Edit User</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="delete"
                  size="sm"
                  color="negative"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>Delete User</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="star"
                  :color="props.row.isFavorite ? 'yellow' : 'grey'"
                  size="sm"
                  @click="toggleFavorite(props.row.id)"
                >
                  <q-tooltip>Toggle favorite</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <!-- Expandable Comments Section -->
            <template #body-cell-expand="props">
              <q-td colspan="100%">
                <div v-if="props.row.comments.length">
                  <q-list>
                    <q-item v-for="comment in props.row.comments" :key="comment.id">
                      <q-item-section>
                        <q-item-label>
                          <strong>{{ comment.name }}</strong> ({{ comment.email }})
                        </q-item-label>
                        <q-item-label caption>{{ comment.body }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <div v-else class="text-grey">No comments yet...</div>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-grey">No posts found</div>
            </template>
          </q-table>
        </q-card>

        <ConfirmDialog
          ref="confirmDialogRef"
          :selected="selected"
          :selectedPostId="selectedPostId"
          @clear-selected="selected = []"
        />
        <PostDialog ref="postDialogRef" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { usePostsStore } from 'src/stores/post-store';
import { useQuasar } from 'quasar';
import PostDialog from './PostDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const $q = useQuasar();

const postDialogRef = ref(null);
const confirmDialogRef = ref(null);
const postStore = usePostsStore();
const selected = ref([]);

const usernameOptions = computed(() => {
  const uniqueUsernames = [...new Set(postStore.posts.map((post) => post.username))];
  return uniqueUsernames.map((name) => ({ label: name, value: name }));
});

// Filters
const titleFilter = ref('');
const usernameFilter = ref([]);
const favoriteFilter = ref('all'); // 'all', 'favorites', 'notFavorites'

const pagination = ref({
  page: 1,
  rowsPerPage: Number(localStorage.getItem('rowsPerPage')) || 10,
});
const filter = ref('');
const filteredPosts = computed(() => {
  return postStore.posts.filter((post) => {
    // 1. Title filter
    const matchesTitle = post.title.toLowerCase().includes(titleFilter.value.toLowerCase());

    // 2. Username filter
    const matchesUsername =
      usernameFilter.value.length === 0 || usernameFilter.value.includes(post.username);

    // 3. Favorite status filter
    let matchesFavorite = true;
    if (favoriteFilter.value === 'favorites') {
      matchesFavorite = post.isFavorite;
    } else if (favoriteFilter.value === 'notFavorites') {
      matchesFavorite = !post.isFavorite;
    }

    return matchesTitle && matchesUsername && matchesFavorite;
  });
});

const posts = computed(() => {
  return postStore.posts;
});
const users = computed(() => {
  return postStore.users;
});

const selectedPostId = ref(null);
const columns: {
  name: string;
  label: string;
  field: string;
  align?: 'left' | 'right' | 'center'; // Explicit type for `align`
  sortable?: boolean;
}[] = [
  { name: 'title', label: 'Title', field: 'title', align: 'left', sortable: true },
  { name: 'body', label: 'Body', field: 'body', align: 'left' },
  { name: 'username', label: 'Username', field: 'username', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'center' },
];

const confirmDelete = (row: any) => {
  selectedPostId.value = row.id;
  confirmDialogRef.value.confirmDeleteDialog = true;
};
function toggleComments(props) {
  props.expand = !props.expand;
  if (props.expand && props.row.comments.length === 0) {
    postStore.fetchComments(props.row.id);
  }
}
function toggleFavorite(postId: number) {
  postStore.toggleFavorite(postId);
  $q.notify({ type: 'positive', message: 'Selected post has toggled.' });
}
watch(
  () => pagination.value.rowsPerPage,
  (newRowsPerPage) => {
    localStorage.setItem('rowsPerPage', newRowsPerPage.toString());
  },
);
onMounted(async () => {
  await postStore.fetchUsers();
  await postStore.fetchPosts();
});
</script>

<style>
.text-wrap {
  white-space: normal;
  word-break: break-word;
  max-height: 4.5em; /* around 3 lines */
  overflow: hidden;
  text-overflow: ellipsis;
}

.responsive-table-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.post-table {
  width: 100%;

  .q-table__top,
  .q-table__bottom {
    padding: 0;
  }

  thead tr {
    th {
      position: sticky;
      top: 0;
      z-index: 1;
      font-weight: bold;
      background-color: #f5f8fa;
      padding: 12px 16px;
    }
  }

  tbody tr {
    transition: background-color 0.3s;
    &:hover {
      background-color: #f0f9ff !important;
    }

    td {
      /* padding: 12px 16px; */
      white-space: pre;
      word-break: break-word;
      max-height: 4.5em; /* around 3 lines */
      overflow: hidden;
      text-overflow: ellipsis;

      &.action-buttons {
        white-space: nowrap;
      }
    }
  }
  /* &.q-table--grid {
    .q-table__grid-content {
      min-height: 200px;
    }
  } */
}

.action-buttons {
  white-space: nowrap;
  min-width: 120px;
}

.confirm-delete-card {
  width: 400px;
  max-width: 90vw;
  border-radius: 8px;
}
</style>

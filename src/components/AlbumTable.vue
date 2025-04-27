<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h4 text-md-h6 text-sm-body1 text-weight-bold text-primary main-header">
            Album Management
          </div>
          <q-btn
            label="Add New Album"
            color="primary"
            @click="albumDialogRef.openCreateAlbumDialog()"
            class="q-px-md"
            icon="add"
            unelevated
            rounded
          />
        </div>
        <q-table
          title="Posts"
          :rows="albums"
          :columns="columns"
          row-key="id"
          class="post-table"
          selection="multiple"
          v-model:selected="selected"
          v-model:pagination="pagination"
          @row-click="goToPhotos"
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
              <q-btn
                flat
                round
                icon="edit"
                size="sm"
                color="primary"
                @click.stop="albumDialogRef.openEditAlbumDialog(props.row)"
              >
                <q-tooltip>Edit Album</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click.stop="confirmDelete(props.row)"
              >
                <q-tooltip>Delete Album</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="star"
                :color="props.row.isFavorite ? 'yellow' : 'grey'"
                size="sm"
                @click.stop="toggleFavorite(props.row.id)"
              >
                <q-tooltip>Toggle favorite</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey">No posts found</div>
          </template>
        </q-table>

        <ConfirmDialog
          ref="confirmDialogRef"
          :selected="selected"
          :selectedAlbumId="selectedAlbumId"
          type="album"
          @clear-selected="selected = []"
        />
        <AlbumDialog ref="albumDialogRef" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAlbumStore } from 'src/stores/album-store';
import { useQuasar } from 'quasar';
import AlbumDialog from './AlbumDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const $q = useQuasar();
const router = useRouter();

const albumDialogRef = ref(null);
const confirmDialogRef = ref(null);
const albumStore = useAlbumStore();
const selected = ref([]);

const usernameOptions = computed(() => {
  const uniqueUsernames = [...new Set(albumStore.albums.map((album) => album.username))];
  return uniqueUsernames.map((name) => ({ label: name, value: name }));
});

function goToPhotos(evt, row) {
  router.push({ path: '/photos', query: { albumId: row.id } });
}

const pagination = ref({
  page: 1,
  rowsPerPage: Number(localStorage.getItem('rowsPerPage')) || 10,
});

const albums = computed(() => {
  return albumStore.albums;
});
const users = computed(() => {
  return albumStore.users;
});

const selectedAlbumId = ref(null);
const columns: {
  name: string;
  label: string;
  field: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
}[] = [
  { name: 'title', label: 'Title', field: 'title', align: 'left', sortable: true },
  { name: 'username', label: 'Username', field: 'username', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'center' },
];

const confirmDelete = (row: any) => {
  selectedAlbumId.value = row.id;
  confirmDialogRef.value.confirmDeleteDialog = true;
};
function toggleFavorite(postId: number) {
  albumStore.toggleFavorite(postId);
  $q.notify({ type: 'positive', message: 'Selected album has toggled.' });
}
watch(
  () => pagination.value.rowsPerPage,
  (newRowsPerPage) => {
    localStorage.setItem('rowsPerPage', newRowsPerPage.toString());
  },
);
onMounted(async () => {
  await albumStore.fetchUsers();
  await albumStore.fetchAlbums();
});
</script>

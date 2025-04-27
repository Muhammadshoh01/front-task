<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h4 text-md-h6 text-sm-body1 text-weight-bold text-primary main-header">
            Todo Management
          </div>
          <q-btn
            label="Add New Todo"
            color="primary"
            @click="todoDialogRef.openCreateTodoDialog()"
            class="q-px-md"
            icon="add"
            unelevated
            rounded
          />
        </div>
        <q-table
          title="Todos"
          :rows="filteredTasks"
          :columns="columns"
          row-key="id"
          class="post-table"
          selection="multiple"
          v-model:selected="selected"
          v-model:pagination="pagination"
        >
          <template v-slot:top>
            <div class="row full-width items-center q-pa-md">
              <div class="text-h6 text-weight-medium">All Todos</div>
              <q-space />
              <div v-if="selected.length > 0">
                <q-btn color="negative" label="Delete Selected" @click="confirmBulkDelete = true" />
              </div>
              <!-- Title Filter -->
              <q-input
                v-model="filterTitle"
                label="Filter by Title"
                dense
                outlined
                clearable
                class="q-ml-md"
                ><template v-slot:append> <q-icon name="search" color="primary" /> </template
              ></q-input>

              <!-- Status Filter -->
              <q-select
                v-model="filterStatus"
                :options="statusOptions"
                label="Filter by Status"
                style="width: 250px"
                dense
                options-dense
                clearable
                outlined
                class="q-ml-md"
                option-label="label"
                option-value="value"
                map-options
                emit-value
              />
            </div>
          </template>

          <!-- Title Column -->
          <template v-slot:body-cell-title="props">
            <q-td :props="props">
              <span :class="{ 'text-strike text-grey': props.row.completed }">
                {{ props.row.title }}
              </span>
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
                @click.stop="todoDialogRef.openEditTodoDialog(props.row)"
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
                dense
                icon="done"
                color="primary"
                @click="toggleTaskCompleted(props.row)"
                :class="{ 'text-strike text-grey': props.row.completed }"
              >
                <q-tooltip>Toggle status</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey">No todos found</div>
          </template>
        </q-table>
        <TodoDialog ref="todoDialogRef" />
        <q-dialog v-model="confirmBulkDelete">
          <q-card class="confirm-delete-card">
            <q-card-section class="row items-center justify-center">
              <q-avatar icon="warning" color="negative" text-color="white" />
              <span class="q-ml-sm text-h6">Confirm Delete</span>
            </q-card-section>

            <q-card-section align="center">
              Are you sure you want to delete {{ selected.length }} todos
            </q-card-section>

            <q-card-actions align="center">
              <q-btn flat label="Cancel" color="primary" v-close-popup />
              <q-btn flat label="Delete" color="negative" @click="bulkDelete" />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-dialog v-model="confirmDeleteDialog" persistent>
          <q-card class="confirm-delete-card">
            <q-card-section class="row items-center justify-center">
              <q-avatar icon="warning" color="negative" text-color="white" />
              <span class="q-ml-sm text-h6">Delete Todo</span>
            </q-card-section>
            <q-card-section align="center">
              Are you sure you want to delete this todo? This action cannot be undone.
            </q-card-section>
            <q-card-actions align="center">
              <q-btn flat label="Cancel" color="primary" v-close-popup />
              <q-btn
                flat
                label="Delete"
                color="negative"
                @click="selectedTodoId !== undefined && deleteTodo(selectedTodoId)"
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTodosStore } from 'src/stores/todos-store';
import { useQuasar } from 'quasar';
import TodoDialog from '../components/TodoDialog.vue';

const $q = useQuasar();
const todoStore = useTodosStore();
const todoDialogRef = ref();

const filterTitle = ref('');
const filterStatus = ref('all');
const selectedTodoId = ref(null);
const selected = ref([]);
const confirmBulkDelete = ref(false);
const confirmDeleteDialog = ref(false);
const filteredTasks = computed(() => {
  let list = todos.value || [];

  if (filterStatus.value === 'completed') {
    list = list.filter((task) => task.completed);
  } else if (filterStatus.value === 'incomplete') {
    list = list.filter((task) => !task.completed);
  }

  if (filterTitle.value) {
    list = list.filter((task) =>
      task.title.toLowerCase().includes(filterTitle.value.toLowerCase()),
    );
  }
  return list.slice().sort((a, b) => a.completed - b.completed);
});
const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Incomplete', value: 'incomplete' },
];
const todos = computed(() => {
  return todoStore.todos;
});
const pagination = ref({
  page: 1,
  rowsPerPage: Number(localStorage.getItem('rowsPerPage')) || 10,
});
const columns: {
  name: string;
  label: string;
  field: string;
  align?: 'left' | 'right' | 'center'; // Explicit type for `align`
  sortable?: boolean;
}[] = [
  { name: 'title', label: 'Title', field: 'title', align: 'left', sortable: true },
  { name: 'actions', label: 'Actions', align: 'center' },
];

function toggleTaskCompleted(task) {
  task.completed = !task.completed;
  $q.notify({
    type: 'positive',
    message: task.completed ? 'Task marked as completed!' : 'Task marked as incomplete!',
  });
}

const bulkDelete = () => {
  selected.value.forEach((todo) => {
    todoStore.deleteTodos(todo.id);
  });

  selected.value = [];
  confirmBulkDelete.value = false;
  $q.notify({
    type: 'negative',
    message: `Deleted selected todos.`,
  });
};

const confirmDelete = (row: any) => {
  selectedTodoId.value = row.id;
  confirmDeleteDialog.value = true;
};

const deleteTodo = async (todoId: number) => {
  await todoStore.deleteTodos(todoId);
  $q.notify({ type: 'negative', message: 'Selected todo deleted.' });
};
watch(
  () => pagination.value.rowsPerPage,
  (newRowsPerPage) => {
    localStorage.setItem('rowsPerPage', newRowsPerPage.toString());
  },
);

onMounted(async () => {
  await todoStore.fetchTodos();
  await todoStore.fetchUsers();
});
</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}
</style>

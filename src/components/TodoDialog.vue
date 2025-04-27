<template>
  <q-dialog v-model="isTodoDialogOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit Todo' : 'Create New Todo' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-form @submit="saveTodo" ref="todoData">
          <div class="q-col-gutter-md">
            <q-input
              v-model="todoForm.title"
              label="Title"
              outlined
              :rules="[(val) => !!val || 'Title is required']"
              stack-label
            />
            <q-select
              v-model="todoForm.userId"
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
        <q-btn flat label="Save" color="primary" @click="saveTodo" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTodosStore } from 'src/stores/todos-store';
// import type { Todo } from 'src/types';

const todoStore = useTodosStore();
const todoData = ref(null);
const isEditing = ref(false);
const isTodoDialogOpen = ref(false);
const todoForm = ref({
  id: null,
  title: '',
  userId: null,
});
const users = computed(() => {
  return todoStore.users;
});

function openCreateTodoDialog() {
  isEditing.value = false;
  todoForm.value = {
    id: null,
    title: '',
    userId: null,
  };
  isTodoDialogOpen.value = true;
}
function openEditTodoDialog(todo) {
  isEditing.value = true;
  todoForm.value = { ...todo };
  isTodoDialogOpen.value = true;
}

async function saveTodo() {
  const success = await todoData.value.validate();
  if (success) {
    if (isEditing.value) {
      await todoStore.editTodos(todoForm.value);
    } else {
      await todoStore.addTodos(todoForm.value);
    }
  } else {
    throw Error('Please enter valid data');
  }
  isTodoDialogOpen.value = false;
}

defineExpose({ isTodoDialogOpen, openCreateTodoDialog, openEditTodoDialog });
</script>

<style></style>

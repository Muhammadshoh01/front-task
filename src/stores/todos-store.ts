import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';

interface Todos {
  id: number;
  title: string;
  userId: number;
  username?: string;
  isFavorite?: boolean;
  completed: boolean;
}

interface User {
  id: number;
  name: string;
}

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todos[]>([]);
  const users = ref<User[]>([]);

  async function fetchTodos() {
    const res = await api.get('/todos');
    todos.value = res.data.map((album: Todos) => ({
      ...album,
      username: users.value.find((u) => u.id === album.userId)?.name || 'Unknown',
    }));
  }

  async function addTodos(newTodos: { title: string; userId: number; completed: boolean }) {
    try {
      const response = await api.post('/todos', newTodos);
      const tempId =
        response.data.id ??
        (todos.value.length ? Math.max(...todos.value.map((p) => p.id)) + 1 : 1);
      todos.value.push({
        id: tempId,
        title: newTodos.title,
        userId: newTodos.userId,
        username: users.value.find((u) => u.id === newTodos.userId)?.name || 'Unknown',
      });
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  }

  async function editTodos(updatedTodos: Todos) {
    try {
      await api.put(`/todos/${updatedTodos.id}`, updatedTodos);
      const index = todos.value.findIndex((p) => p.id === updatedTodos.id);
      if (index !== -1) {
        todos.value[index] = {
          ...updatedTodos,
          username:
            users.value.find((u) => u.id === updatedTodos.userId)?.name ||
            todos.value[index].username ||
            'Unknown',
        };
      }
    } catch (error) {
      console.error('Failed to edit todo:', error);
    }
  }

  async function deleteTodos(albumId: number) {
    await api.delete(`/todos/${albumId}`);
    todos.value = todos.value.filter((p) => p.id !== albumId);
  }

  async function fetchUsers() {
    const res = await api.get('/users');
    users.value = res.data;
  }

  return {
    todos,
    users,
    fetchTodos,
    addTodos,
    editTodos,
    fetchUsers,
    deleteTodos,
  };
});

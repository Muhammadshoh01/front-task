import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';

interface Album {
  id: number;
  title: string;
  userId: number;
  username?: string;
  isFavorite?: boolean;
}

interface User {
  id: number;
  name: string;
}

export const useAlbumStore = defineStore('albums', () => {
  const albums = ref<Album[]>([]);
  const users = ref<User[]>([]);

  async function fetchAlbums() {
    const res = await api.get('/albums');
    albums.value = res.data.map((album: Album) => ({
      ...album,
      username: users.value.find((u) => u.id === album.userId)?.name || 'Unknown',
      isFavorite: getFavoriteAlbumIds().includes(album.id),
    }));
  }

  async function addAlbum(newAlbum: { title: string; userId: number }) {
    try {
      const response = await api.post('/albums', newAlbum);
      const tempId =
        response.data.id ??
        (albums.value.length ? Math.max(...albums.value.map((p) => p.id)) + 1 : 1);
      albums.value.push({
        id: tempId,
        title: newAlbum.title,
        userId: newAlbum.userId,
        username: users.value.find((u) => u.id === newAlbum.userId)?.name || 'Unknown',
        isFavorite: false,
      });
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  }

  async function editAlbum(updatedAlbum: Album) {
    try {
      await api.put(`/albums/${updatedAlbum.id}`, updatedAlbum);
      const index = albums.value.findIndex((p) => p.id === updatedAlbum.id);
      if (index !== -1) {
        albums.value[index] = {
          ...updatedAlbum,
          username:
            users.value.find((u) => u.id === updatedAlbum.userId)?.name ||
            albums.value[index].username ||
            'Unknown',
          isFavorite: albums.value[index].isFavorite ?? false,
        };
      }
    } catch (error) {
      console.error('Failed to edit post:', error);
    }
  }

  async function deleteAlbum(albumId: number) {
    await api.delete(`/albums/${albumId}`);
    albums.value = albums.value.filter((p) => p.id !== albumId);
  }

  async function fetchUsers() {
    const res = await api.get('/users');
    users.value = res.data;
  }

  function toggleFavorite(albumId: number) {
    const post = albums.value.find((p) => p.id === albumId);
    if (!post) return;

    post.isFavorite = !post.isFavorite;
    updateFavoriteAlbumIds();
  }

  function updateFavoriteAlbumIds() {
    const favorites = albums.value.filter((p) => p.isFavorite).map((p) => p.id);
    localStorage.setItem('favoriteAlbums', JSON.stringify(favorites));
  }

  function getFavoriteAlbumIds(): number[] {
    return JSON.parse(localStorage.getItem('favoriteAlbums') || '[]');
  }

  return {
    albums,
    users,
    fetchAlbums,
    addAlbum,
    editAlbum,
    fetchUsers,
    deleteAlbum,
    toggleFavorite,
  };
});

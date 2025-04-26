import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios'; // your axios instance

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  comments: Comment[];
  expand: boolean;
  username?: string;
  isFavorite?: boolean;
  commentsVisible: boolean;
}

interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
}

interface User {
  id: number;
  name: string;
}

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([]);
  const users = ref<User[]>([]);

  async function fetchPosts() {
    const res = await api.get('/posts');
    posts.value = res.data.map((post: Post) => ({
      ...post,
      comments: [],
      expand: false,
      commentsVisible: false,
      username: users.value.find((u) => u.id === post.userId)?.name || 'Unknown',
      isFavorite: getFavoritePostIds().includes(post.id),
    }));
  }

  async function addPost(newPost: { title: string; body: string; userId: number }) {
    try {
      const response = await api.post('/posts', newPost);

      const tempId =
        response.data.id ??
        (posts.value.length ? Math.max(...posts.value.map((p) => p.id)) + 1 : 1);

      posts.value.push({
        id: tempId,
        title: newPost.title,
        body: newPost.body,
        userId: newPost.userId,
        commentsVisible: false,
        comments: [],
        expand: false,
        username: users.value.find((u) => u.id === newPost.userId)?.name || 'Unknown',
        isFavorite: false,
      });
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  }

  async function editPost(updatedPost: Post) {
    try {
      await api.put(`/posts/${updatedPost.id}`, updatedPost);
      const index = posts.value.findIndex((p) => p.id === updatedPost.id);
      if (index !== -1) {
        posts.value[index] = {
          ...updatedPost,
          comments: posts.value[index].comments,
          expand: posts.value[index].expand,
          username:
            users.value.find((u) => u.id === updatedPost.userId)?.name ||
            posts.value[index].username ||
            'Unknown',
          isFavorite: posts.value[index].isFavorite ?? false, // <--- Ensure it's boolean
        };
      }
    } catch (error) {
      console.error('Failed to edit post:', error);
    }
  }

  async function deletePost(postId: number) {
    await api.delete(`/posts/${postId}`);
    posts.value = posts.value.filter((p) => p.id !== postId);
  }

  async function fetchUsers() {
    const res = await api.get('/users');
    users.value = res.data;
  }

  async function fetchComments(postId: number) {
    const post = posts.value.find((p) => p.id === postId);
    if (post) {
      // Fetch comments only if they are not already fetched
      if (post.comments.length === 0) {
        const res = await api.get(`/comments?postId=${postId}`);
        post.comments = res.data;
      }
      // Toggle the visibility of comments
      post.commentsVisible = !post.commentsVisible;
    }
  }

  function toggleFavorite(postId: number) {
    const post = posts.value.find((p) => p.id === postId);
    if (!post) return;

    post.isFavorite = !post.isFavorite;
    updateFavoritePostIds();
  }

  function updateFavoritePostIds() {
    const favorites = posts.value.filter((p) => p.isFavorite).map((p) => p.id);
    localStorage.setItem('favoritePosts', JSON.stringify(favorites));
  }

  function getFavoritePostIds(): number[] {
    return JSON.parse(localStorage.getItem('favoritePosts') || '[]');
  }

  return {
    posts,
    users,
    fetchPosts,
    addPost,
    editPost,
    fetchUsers,
    fetchComments,
    deletePost,
    toggleFavorite,
  };
});

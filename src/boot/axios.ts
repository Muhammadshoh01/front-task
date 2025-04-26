import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});

export default boot(({ app }) => {
  app.provide('api', api);
});

export { api };

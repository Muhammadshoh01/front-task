import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';

declare module 'pinia' {
  export interface PiniaCustomProperties {}
}
export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia();

  return pinia;
});

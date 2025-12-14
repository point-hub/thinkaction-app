import { defineNuxtPlugin } from '#app';
import { PluginBaseComponents, PluginInputMask, PluginTooltip } from '@point-hub/papp';

export default defineNuxtPlugin({
  name: 'register-base-component-plugin',
  parallel: true,
  async setup (nuxtApp) {
    nuxtApp.vueApp.use(PluginBaseComponents);
    nuxtApp.vueApp.use(PluginInputMask);
    nuxtApp.vueApp.use(PluginTooltip);
  },
});

import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import { Realtime, type TokenRequest, type ErrorInfo } from 'ably';
import { ChatClient } from '@ably/chat';

export default defineNuxtPlugin({
  name: 'ably-client-plugin',
  parallel: true,
  async setup (nuxtApp) {
    const config = useRuntimeConfig();

    let ablyInstance: Realtime | null = null;
    let chatInstance: ChatClient | null = null;
    let connecting: Promise<void> | null = null;

    async function getAbly(): Promise<Realtime> {
      if (ablyInstance) return ablyInstance;
      if (connecting) {
        await connecting;
        return ablyInstance!;
      }

      connecting = (async () => {
        const client = new Realtime({
          autoConnect: false,
          echoMessages: false,
          authCallback: async (params, callback) => {
            try {
              const token = await $fetch<TokenRequest>(`${config.public.apiBase}/ably/token`, {
                method: 'POST',
                credentials: 'include',
                body: params,
              });
              callback(null, token);
            } catch (err) {
              console.error('[Ably] Auth failed:', err);
              callback(err as ErrorInfo, null);
            }
          },
        });

        client.connect();

        ablyInstance = client;
        connecting = null;
      })();

      await connecting;
      return ablyInstance!;
    }

    async function getChat(): Promise<ChatClient> {
      if (chatInstance) return chatInstance;
      const ably = await getAbly();
      chatInstance = new ChatClient(ably);
      return chatInstance;
    }

    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        ablyInstance?.close();
        ablyInstance = null;
        chatInstance = null;
        connecting = null;
      });
    }

    return {
      provide: {
        ably: getAbly,
        ablyChat: getChat,
      },
    };
  },
});

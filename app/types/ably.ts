import type { Realtime } from 'ably';
import type { ChatClient } from '@ably/chat';

declare module '#app' {
  interface NuxtApp {
    $ably: () => Promise<Realtime>
    $ablyChat: () => Promise<ChatClient>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $ably: () => Promise<Realtime>
    $ablyChat: () => Promise<ChatClient>
  }
}

export {};

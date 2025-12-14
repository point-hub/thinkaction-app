import { ref, onUnmounted, getCurrentInstance } from 'vue';
import type {
  Message,
  PresenceEvent,
  PresenceMember,
  Room,
  TypingSetEvent,
} from '@ably/chat';
import { PresenceEventType } from '@ably/chat';
import type { Realtime } from 'ably';
import { useAbly } from './ably';

/**
 * Reactive composable for managing a single Ably Chat room.
 * Handles presence, messages, typing indicators, and connection lifecycle.
 */
export function useChatRoom(roomName: string) {
  if (!getCurrentInstance()) {
    throw new Error('useChatRoom() must be called inside setup()');
  }

  /* Reactive state */
  const room = ref<Room | null>(null);
  const members = ref<PresenceMember[]>([]);
  const messages = ref<Message[]>([]);
  const typingUsers = ref<Set<string>>(new Set());

  let isInitialized = false;

  /** Initialize the room, subscribe to events */
  const initRoom = async (): Promise<void> => {
    if (isInitialized) return;
    if (!roomName) throw new Error('Room name is required');

    const { ably: realtime, chat: chatClient } = await useAbly();
    await ensureConnected(realtime);

    // Create or get the chat room instance
    const chatRoom = await chatClient.rooms.get(roomName);
    if (!chatRoom) throw new Error(`Room "${roomName}" not found`);
    room.value = chatRoom;

    // Ensure room is attached before presence or messaging
    await ensureRoomAttached(chatRoom);

    // Subscribe to events
    subscribePresences(chatRoom);
    subscribeMessages(chatRoom);
    subscribeTypings(chatRoom);

    // Get current online members
    const online = await chatRoom.presence.get();
    members.value = online;

    isInitialized = true;
  };

  /** Ensure Realtime connection is active */
  const ensureConnected = async (realtime: Realtime): Promise<void> => {
    if (realtime.connection.state === 'connected') return;
    return new Promise<void>((resolve, reject) => {
      realtime.connection.once('connected', () => resolve());
      realtime.connection.once('failed', () => reject(new Error('Ably connection failed')));
      realtime.connect();
    });
  };

  /** Ensure room is attached before using presence or messages */
  const ensureRoomAttached = async (chatRoom: Room): Promise<void> => {
    const state = chatRoom.channel.state;
    if (state === 'attached') return;
    if (state === 'attaching') {
      return new Promise<void>((resolve, reject) => {
        chatRoom.channel.once('attached', () => resolve());
        chatRoom.channel.once('failed', () => reject(new Error('Room attach failed')));
      });
    }
    return new Promise<void>((resolve, reject) => {
      // Listen for attach/fail events and then call attach (no callback)
      chatRoom.channel.once('attached', () => resolve());
      chatRoom.channel.once('failed', () => reject(new Error('Room attach failed')));
      chatRoom.channel.attach();
    });
  };

  const subscribePresences = (chatRoom: Room): void => {
    chatRoom.presence.subscribe((event: PresenceEvent) => {
      const { member, type } = event;
      if (!member) return;

      switch (type) {
      case PresenceEventType.Enter:
        if (!members.value.some((m) => m.clientId === member.clientId)) {
          members.value.push(member);
        }
        break;
      case PresenceEventType.Leave:
        members.value = members.value.filter((m) => m.clientId !== member.clientId);
        break;
      case PresenceEventType.Update:
        members.value = members.value.map((m) =>
          m.clientId === member.clientId ? member : m,
        );
        break;
      }
    });
  };

  const subscribeMessages = (chatRoom: Room): void => {
    chatRoom.messages.subscribe((event) => {
      switch (event.type) {
      case 'message.created':
        messages.value.push(event.message);
        break;
      case 'message.updated': {
        const idx = messages.value.findIndex((m) => m.serial === event.message.serial);
        if (idx !== -1) messages.value[idx] = event.message;
        break;
      }
      case 'message.deleted':
        messages.value = messages.value.filter(
          (m) => m.serial !== event.message.serial,
        );
        break;
      }
    });
  };

  const subscribeTypings = (chatRoom: Room): void => {
    chatRoom.typing.subscribe((event: TypingSetEvent) => {
      typingUsers.value = new Set(event.currentlyTyping);
    });
  };

  /** Send a message */
  const sendMessage = async (text: string): Promise<void> => {
    if (!room.value || !text.trim()) return;
    await room.value.messages.send({ text });

    // Stop typing after sending
    try {
      await room.value.typing.stop();
    } catch (err) {
      console.warn('[ChatRoom] failed to stop typing:', err);
    }
  };

  /** Enter presence (go online) */
  const enterPresence = async (username: string): Promise<void> => {
    if (!room.value) return;
    await ensureRoomAttached(room.value);
    await room.value.presence.enter({ username, status: 'online' });
  };

  /** Typing indicator */
  const typing = async(): Promise<void> => {
    await room.value?.typing.keystroke();
  };

  /** Cleanup */
  onUnmounted(() => {
    if (room.value) {
      try {
        room.value.presence.leave();
      } catch (err) {
        console.warn('[ChatRoom] leave presence failed:', err);
      }
    }
  });

  return {
    room,
    initRoom,
    subscribePresences,
    enterPresence,
    members,
    subscribeMessages,
    sendMessage,
    messages,
    subscribeTypings,
    typingUsers,
    typing,
  };
}

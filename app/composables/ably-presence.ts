import { ref, onUnmounted, getCurrentInstance } from 'vue';
import type {
  PresenceMessage,
  Realtime,
  RealtimeChannel,
} from 'ably';
import { useAbly } from './ably';

export function useAblyPresence(channelName: string) {
  if (!getCurrentInstance()) {
    throw new Error('useAblyPresence() must be called inside setup()');
  }

  const members = ref<PresenceMessage[]>([]);
  const channel = ref<RealtimeChannel | null>(null);
  const isConnected = ref(false);

  /** Initialize presence channel */
  async function initPresence(username: string) {
    const { ably } = await useAbly();

    const realtime = ably as Realtime;

    // Get realtime channel
    const ch = realtime.channels.get(
      `presence:${channelName}`,
    ) as RealtimeChannel;

    channel.value = ch;

    // Ensure connection
    await ensureConnected(realtime);

    // Enter presence
    await ch.presence.enter({
      username,
      status: 'online',
    });

    // Subscribe to presence updates
    subscribePresence(ch);

    // Load current members
    members.value = await ch.presence.get();

    isConnected.value = true;
  }

  /** Subscribe to presence updates */
  function subscribePresence(ch: RealtimeChannel) {
    ch.presence.subscribe('enter', (member) => {
      if (!members.value.some((m) => m.clientId === member.clientId)) {
        members.value.push(member);
      }
    });

    ch.presence.subscribe('leave', (member) => {
      members.value = members.value.filter(
        (m) => m.clientId !== member.clientId,
      );
    });

    ch.presence.subscribe('update', (member) => {
      members.value = members.value.map((m) =>
        m.clientId === member.clientId ? member : m,
      );
    });
  }

  /** Ensure realtime connection */
  function ensureConnected(realtime: Realtime) {
    if (realtime.connection.state === 'connected') return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      realtime.connection.once('connected', () => resolve());
      realtime.connection.once('failed', () =>
        reject(new Error('Ably connection failed')),
      );
      realtime.connect();
    });
  }

  /** Leave presence cleanly */
  async function leavePresence() {
    try {
      if (channel.value) {
        await channel.value.presence.leave();
      }
      isConnected.value = false;
    } catch (err) {
      console.warn('[useAblyPresence] leave failed:', err);
    }
  }

  /** Cleanup on unmount */
  onUnmounted(() => {
    leavePresence();
  });

  return {
    members,
    isConnected,
    initPresence,
    leavePresence,
  };
}

export default defineNuxtPlugin({
  name: 'last-seen-client-plugin',
  parallel: true,
  async setup (nuxtApp) {
    const { user, updateLastSeen } = useAuth();
    const INTERVAL_MS = 60000; // 1 minute

    const heartbeat = () => {
      if (user.value) {
        updateLastSeen();
      }
    };

    heartbeat();

    const intervalId = setInterval(heartbeat, INTERVAL_MS);

    nuxtApp.hook('app:mounted', () => {
      window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
      });
    });
  },
});

export default defineNuxtPlugin({
  name: 'auth-client-plugin',
  parallel: true,
  async setup (nuxtApp) {
    const { user, me, updateUser } = useAuth();

    if (!user.value) {
      try {
        await me();
      } catch (error) {
        updateUser(null);
      }
    }
  },
});

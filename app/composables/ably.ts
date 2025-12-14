export async function useAbly() {
  const { $ably, $ablyChat } = useNuxtApp();
  return {
    ably: await $ably(),
    chat: await $ablyChat(),
  };
}

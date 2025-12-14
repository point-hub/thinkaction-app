<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
}>(), {
  size: 48,
});

const { user } = useAuth();

const userAvatar = computed(() => {
  return user.value?.avatar?.public_domain && user.value?.avatar?.public_path
    ? `${user.value.avatar.public_domain}${user.value.avatar.public_path}`
    : '';
});
</script>

<template>
  <base-avatar :name="user?.username" :alt="user?.username + '-avatar'" :src="userAvatar" :size="size" />
</template>

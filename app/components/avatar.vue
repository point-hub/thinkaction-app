<script setup lang="ts">
withDefaults(defineProps<{
  user?: IUser | null
  size?: number
  indicator?: boolean
  colorIndicator?: string
}>(), {
  size: 48,
  indicator: false,
  colorIndicator: 'secondary',
});

</script>

<template>
  <base-avatar :name="user?.username" :alt="user?.username + '-avatar'" :src="`${user?.avatar?.public_domain??''}${user?.avatar?.public_path??''}`" :indicator="indicator" :color-indicator="colorIndicator" :size="size" />
</template>

<script setup lang="ts">
const route = useRoute();

const menuItems = [
  { name: 'Edit Profile', path: '/profile/edit', icon: 'i-carbon-user-avatar' },
  { name: 'Password', path: '/profile/password', icon: 'i-carbon-password' },
  { name: 'Account Privacy', path: '/profile/account-privacy', icon: 'i-carbon-locked' },
];

const isCurrentRoute = (path: string) => {
  return route.path === path;
};
</script>

<template>
  <nav>
    <ul>
      <li v-for="item in menuItems" :key="item.path" class="relative">
        <nuxt-link
          :to="item.path"
          class="flex items-center gap-3 py-2.5 pl-6 pr-4 text-base transition-all duration-300 relative text-gray-900 hover:bg-gray-100"
          :class="{
            'text-black bg-slate-100 font-extrabold': isCurrentRoute(item.path),
          }"
        >
          <div :class="[item.icon, 'text-xl']" />
          <span class="truncate">{{ item.name }}</span>
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

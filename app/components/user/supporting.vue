<script setup lang="ts">
import { useApiSupports } from '~/composables/api/supports';

const totalSupporting = defineModel<number>('total-supporting', { default: 0 });

const user_id = defineModel<string>('user_id');
const apiSupports = useApiSupports();
const supports = ref();

const fetchSupports = async () => {
  const response = await apiSupports.retrieveAll({
    page_size: 100,
    filter: {
      supporter_id: user_id.value,
    },
  });

  supports.value = response;
  totalSupporting.value = response.pagination.total_document;
};

onMounted(async () => {
  await fetchSupports();
});

defineExpose({
  fetchSupports,
});
</script>

<template>
  <div class="relative grid grid-cols-2 gap-4">
    <div v-for="support in supports?.data" :key="support._id">
      <router-link :to="`/@${support?.supporting?.username}`">
        <div class="flex shadow bg-white items-center p-4 gap-3 cursor-pointer">
          <avatar :user="support.supporting" />
          <div class="flex flex-col">
            <span class="font-semibold text-base">{{ support.supporting?.username }}</span>
            <span class="font-extralight text-xs">{{ support.supporting?.profile?.status }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

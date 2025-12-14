<script setup lang="ts">
import { ref } from 'vue';
import { useApiSupports } from '~/composables/api/supports';
import { useApiUsers } from '~/composables/api/users';
import formatShortNumber from '~/utils/format-short-number';
import UserSupporters from '~/components/user/supporters.vue';

const tabs: { name: string; icon: string }[] = [
  { name: 'Goals', icon: 'i-mingcute:target-fill' },
  { name: 'Supporters', icon: 'i-lucide:users' },
  { name: 'Supporting', icon: 'i-lucide:user-star' },
];
const activeTab = ref(tabs[0]!.name);

const route = useRoute();
const { user: myUser } = useAuth();
const apiSupports = useApiSupports();
const apiUsers = useApiUsers();

const totalGoals = ref(0);
const totalSupporters = ref(0);
const totalSupporting = ref(0);
const supportersRef = ref<InstanceType<typeof UserSupporters> | null>(null);

if (!route.params.username?.toString().startsWith('@')) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' });
}

const username = ref();
username.value = route.params.username.slice(1, route.params.username.length);

const {data: users} = await apiUsers.retrieveAllReactive({
  filter: { username: username.value },
});

const isUserExists = computed(() => {
  return (users.value?.data?.length ?? 0) > 0;
});

const user = ref(users.value?.data?.[0]);

const mySupport = ref();
const fetchMySupport = async () => {
  try {
    const response = await apiSupports.retrieveAll({
      filter: { supporter_id: myUser.value?._id, supporting_id: user.value?._id },
    });

    return {
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    console.error(error);
  }
};

mySupport.value = await fetchMySupport();

const isImSupporting = computed(() => {
  return mySupport.value?.pagination?.total_document > 0;
});

const isSavingSupportAction = ref(false);
const onSupport = async () => {
  if (isSavingSupportAction.value === true) return;
  isSavingSupportAction.value = true;

  try {
    await apiSupports.create({
      supporter_id: myUser.value?._id,
      supporting_id: user.value?._id,
    });
    mySupport.value = await fetchMySupport();
    supportersRef.value?.fetchSupports();
  } catch (error) {
    console.error(error);
  } finally {
    isSavingSupportAction.value = false;
  }
};

const onUnsupport = async () => {
  if (isSavingSupportAction.value === true) return;
  isSavingSupportAction.value = true;
  try {
    await apiSupports.remove(mySupport.value.data[0]!._id as string);
    mySupport.value = await fetchMySupport();
    supportersRef.value?.fetchSupports();
  } catch (err) {
    console.error('support error', err);
  } finally {
    isSavingSupportAction.value = false;
  }
};
</script>

<template>
  <layouts-with-aside aside-title="">
    <div v-if="isUserExists" class="min-h-svh bg-body">
      <!-- Profile Header -->
      <div class="w-full px-4 py-8">
        <div class="flex items-center items-start gap-6">
          <div class="flex flex-col items-center py-2 px-4">
            <avatar :user="user" :size="128" />
            <div v-if="myUser && myUser?.username !== username" class="flex gap-2 mt-2">
              <base-button v-if="!isImSupporting" type="button" variant="filled" color="secondary" size="sm" class="rounded px-5!" :is-loading="isSavingSupportAction" @click="onSupport">
                Support
              </base-button>
              <base-button v-else type="button" variant="filled" color="secondary" size="sm" class="rounded px-5!" :is-loading="isSavingSupportAction" @click="onUnsupport">
                Unsupport
              </base-button>
            </div>
          </div>
          <div class="flex-1">
            <div class="mt-2">
              <!-- Username -->
              <div class="text-lg font-semibold">
                {{ user?.username }}
              </div>
              <!-- User status -->
              <p class="whitespace-pre-line text-xs text-slate-500 text-sm line-clamp-1">
                {{ user?.profile?.status }}
              </p>
              <!-- User bio -->
              <p v-if="user?.profile?.bio" class="whitespace-pre-line text-slate-700 text-sm mt-3">
                {{ user?.profile?.bio }}
              </p>
              <p v-else class="whitespace-pre-line text-slate-500 text-sm mt-3 line-clamp-3">
                No bio yet — share a bit about yourself and inspire others! ✨
              </p>

              <div class="flex gap-6 mt-4 text-sm text-slate-700">
                <div><strong>{{ formatShortNumber(totalGoals) }}</strong> Goals</div>
                <div><strong>{{ formatShortNumber(totalSupporters) }}</strong> Supporters</div>
                <div><strong>{{ formatShortNumber(totalSupporting) }}</strong> Supporting</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-y border-slate-200">
        <div class="flex justify-between gap-4 text-sm font-medium text-slate-600 text-center">
          <button
            v-for="t in tabs"
            :key="t.name"
            :class="[
              'flex-1 py-3',
              activeTab === t.name
                ? 'border-b-2 border-black text-black'
                : 'text-slate-500'
            ]"
            @click="activeTab = t.name"
          >
            <div class="space-x-1">
              <span :class="[t.icon, 'text-xl']" />
              <span class="text-center">{{ t.name }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Goals Tab -->
      <div v-show="activeTab === 'Goals'" class="mx-auto gap-1 lg:p-8">
        <user-goals ref="goalsRef" v-model:total-goals="totalGoals" :user="user" />
      </div>

      <!-- Supporters Tab -->
      <div v-show="activeTab === 'Supporters'" class="mx-auto gap-1 p-4 lg:p-8">
        <user-supporters ref="supportersRef" v-model:total-supporters="totalSupporters" :user_id="user?._id" />
      </div>

      <!-- Supporting Tab -->
      <div v-show="activeTab === 'Supporting'" class="mx-auto gap-1 p-4 lg:p-8">
        <user-supporting v-model:total-supporting="totalSupporting" :user_id="user?._id" />
      </div>
    </div>

    <!-- Profile isn't available -->
    <div v-else class="w-full h-full flex justify-center items-center">
      <div class="flex flex-col items-center justify-center text-center p-20 rounded-2xl shadow bg-white dark:bg-slate-900">
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Profile isn't available</h2>
        <p class="mt-2 text-slate-500 dark:text-slate-300 max-w-[36rem]">
          It may have been removed or the username is incorrect.
        </p>
      </div>
    </div>
  </layouts-with-aside>
</template>

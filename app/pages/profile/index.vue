<script setup lang="ts">
import { ref } from 'vue';
import formatShortNumber from '~/utils/format-short-number';

const tabs: { name: string; icon: string }[] = [
  { name: 'Goals', icon: 'i-mingcute:target-fill' },
  { name: 'Supporters', icon: 'i-lucide:users' },
  { name: 'Supporting', icon: 'i-lucide:user-star' },
];
const activeTab = ref(tabs[0]!.name);

const { user: myUser } = useAuth();

const totalGoals = ref(0);
const totalSupporters = ref(0);
const totalSupporting = ref(0);
</script>

<template>
  <layouts-with-aside aside-title="">
    <div class="min-h-svh bg-body">
      <!-- Profile Header -->
      <div class="w-full px-4 py-8">
        <div class="flex items-center items-start gap-6">
          <div class="flex flex-col items-center py-2 px-4">
            <avatar-uploader />
            <div class="flex gap-2">
              <nuxt-link to="/profile/edit">
                <base-button type="button" variant="filled" color="secondary" size="sm" class="rounded px-5!">
                  Edit Profile
                </base-button>
              </nuxt-link>
            </div>
          </div>
          <div class="flex-1">
            <div class="mt-2">
              <!-- Username -->
              <div class="text-lg font-semibold">
                {{ myUser?.username }}
              </div>
              <!-- User status -->
              <p class="whitespace-pre-line text-xs text-slate-500 text-sm line-clamp-1">
                {{ myUser?.profile?.status }}
              </p>
              <!-- User bio -->
              <p v-if="myUser?.profile?.bio" class="whitespace-pre-line text-slate-700 text-sm mt-3">
                {{ myUser?.profile?.bio }}
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
        <user-goals v-model:total-goals="totalGoals" :user="myUser!" />
      </div>

      <!-- Supporters Tab -->
      <div v-show="activeTab === 'Supporters'" class="mx-auto gap-1 p-4 lg:p-8">
        <user-supporters ref="supportersRef" v-model:total-supporters="totalSupporters" :user_id="myUser?._id" />
      </div>

      <!-- Supporting Tab -->
      <div v-show="activeTab === 'Supporting'" class="mx-auto gap-1 p-4 lg:p-8">
        <user-supporting v-model:total-supporting="totalSupporting" :user_id="myUser?._id" />
      </div>
    </div>
  </layouts-with-aside>
</template>

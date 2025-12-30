<script setup lang="ts">
import { ref, computed } from 'vue';
import { useApiSupports } from '~/composables/api/supports';
import formatShortNumber from '~/utils/format-short-number';

const tabs: { name: string; icon: string }[] = [
  { name: 'Public Goals', icon: 'i-mingcute:target-fill' },
  { name: 'Supporters Only', icon: 'i-lucide:users' },
  { name: 'Private', icon: 'i-lucide:user-star' },
];

const activeTab = ref(tabs[0]!.name);

const { user: myUser } = useAuth();

const totalGoals1 = ref(0);
const totalGoals2 = ref(0);
const totalGoals3 = ref(0);

const totalGoals = computed(() => {
  return (
    totalGoals1.value +
    totalGoals2.value +
    totalGoals3.value
  );
});

const totalSupporters = ref(0);
const totalSupporting = ref(0);

/* -----------------------------------------------------
 * Modal state
 * ----------------------------------------------------- */
const isModalOpen = ref(false);
const modalType = ref<'supporters' | 'supporting' | null>(null);

const openSupporters = () => {
  modalType.value = 'supporters';
  isModalOpen.value = true;
};

const openSupporting = () => {
  modalType.value = 'supporting';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  modalType.value = null;
};

const apiSupports = useApiSupports();
const fetchSupports = async () => {
  const response = await apiSupports.retrieveAll({
    page_size: 1,
    filter: {
      supporter_id: myUser.value?._id,
    },
  });

  const response2 = await apiSupports.retrieveAll({
    page_size: 1,
    filter: {
      supporting_id: myUser.value?._id,
    },
  });

  totalSupporting.value = response.pagination.total_document;
  totalSupporters.value = response2.pagination.total_document;
};

onMounted(async () => {
  await fetchSupports();
});
</script>

<template>
  <layouts-with-aside aside-title="">
    <div class="min-h-svh bg-body">
      <!-- Profile Header -->
      <div class="w-full px-4 py-8">
        <div class="flex flex-col lg:flex-row items-center items-start gap-6">
          <div class="flex flex-col items-center py-2 px-4">
            <avatar-uploader />
            <div class="flex gap-2">
              <nuxt-link to="/profile/edit">
                <base-button
                  type="button"
                  variant="filled"
                  color="secondary"
                  size="sm"
                  class="rounded px-5!"
                >
                  Edit Profile
                </base-button>
              </nuxt-link>
            </div>
          </div>

          <div class="flex-1">
            <div class="text-center lg:text-left">
              <!-- Username -->
              <div class="text-lg font-semibold">
                {{ myUser?.username }}
              </div>

              <!-- User status -->
              <p class="whitespace-pre-line text-xs text-slate-500 line-clamp-1">
                {{ myUser?.profile?.status }}
              </p>

              <!-- User bio -->
              <p
                v-if="myUser?.profile?.bio"
                class="whitespace-pre-line text-slate-700 text-sm mt-3"
              >
                {{ myUser?.profile?.bio }}
              </p>
              <p
                v-else
                class="whitespace-pre-line text-slate-500 text-sm mt-3 line-clamp-3"
              >
                No bio yet — share a bit about yourself and inspire others! ✨
              </p>

              <!-- Stats -->
              <div
                class="flex gap-6 mt-4 text-sm text-slate-700 justify-center lg:justify-start"
              >
                <div>
                  <strong>{{ formatShortNumber(totalGoals) }}</strong> Goals
                </div>

                <button
                  class="hover:underline cursor-pointer"
                  @click="openSupporters"
                >
                  <strong>{{ formatShortNumber(totalSupporters) }}</strong>
                  Supporters
                </button>

                <button
                  class="hover:underline cursor-pointer"
                  @click="openSupporting"
                >
                  <strong>{{ formatShortNumber(totalSupporting) }}</strong>
                  Supporting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-y border-slate-200">
        <div
          class="flex justify-between gap-4 text-sm font-medium text-slate-600 text-center"
        >
          <button
            v-for="t in tabs"
            :key="t.name"
            :class="[
              'flex-1 py-3',
              activeTab === t.name
                ? 'border-b-2 border-black text-black'
                : 'text-slate-500',
            ]"
            @click="activeTab = t.name"
          >
            <div class="space-x-1">
              <span :class="[t.icon, 'text-xl']" />
              <span>{{ t.name }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Goals Tabs -->
      <div v-show="activeTab === 'Public Goals'" class="mx-auto gap-1 lg:p-8">
        <user-goals-public
          v-model:total-goals="totalGoals1"
          :user="myUser!"
        />
      </div>

      <div
        v-show="activeTab === 'Supporters Only'"
        class="mx-auto gap-1 p-4 lg:p-8"
      >
        <user-goals-supporters-only
          v-model:total-goals="totalGoals2"
          :user="myUser!"
        />
      </div>

      <div v-show="activeTab === 'Private'" class="mx-auto gap-1 p-4 lg:p-8">
        <user-goals-private
          v-model:total-goals="totalGoals3"
          :user="myUser!"
        />
      </div>

      <!-- Modal -->
      <Teleport to="body">
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
        >
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/40"
            @click="closeModal"
          />

          <!-- Modal Content -->
          <div
            class="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between px-4 py-3 border-b border-slate-200"
            >
              <h3 class="font-semibold text-sm">
                {{ modalType === 'supporters' ? 'Supporters' : 'Supporting' }}
              </h3>
              <button
                class="text-slate-500 hover:text-black"
                @click="closeModal"
              >
                ✕
              </button>
            </div>

            <!-- Body -->
            <div class="p-4 max-h-[60vh] overflow-y-auto">
              <user-supporters
                v-if="modalType === 'supporters'"
                v-model:total-supporters="totalSupporters"
                :user_id="myUser?._id"
              />

              <user-supporting
                v-if="modalType === 'supporting'"
                v-model:total-supporting="totalSupporting"
                :user_id="myUser?._id"
              />
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </layouts-with-aside>
</template>

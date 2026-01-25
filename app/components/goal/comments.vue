<script setup lang="ts">
import type { IGoal } from '~/composables/api/goals';
import { ref, computed, watch } from 'vue';
import { useApiComments, type IComment } from '~/composables/api/comments';
import { useApiUsers } from '~/composables/api/users';

/* =====================
 * Models & APIs
 * ===================== */
const goal = defineModel<IGoal>('goal');
const isOpen = defineModel<boolean>('isOpen', { default: false });

const apiComments = useApiComments();
const { user: myUser } = useAuth();

/* =====================
 * Comments state
 * ===================== */
const comments = ref<{
  data: IComment[]
  pagination?: {
    page?: number
    limit?: number
    total?: number
    has_next?: boolean
  }
}>({
  data: [],
});

/* =====================
 * Infinite scroll state
 * ===================== */
const page = ref(1);
const hasMore = ref(true);
const isLoadingMore = ref(false);
const scrollRef = ref<HTMLElement | null>(null);

/* =====================
 * Mentions
 * ===================== */
type Trigger = '@' | '#'

interface MentionOption {
  _id: string
  label: string
  link?: string
}

const userOptions = ref<MentionOption[]>([]);
const mentions = ref<MentionOption[]>([]);
const isMentionLoading = ref(false);

/* =====================
 * Tokenized comments
 * ===================== */
const tokenizedComments = computed(() =>
  comments.value.data.map((c) =>
    useMentionTokens(c.comment ?? '', c.mentions),
  ),
);

/* =====================
 * Fetch comments
 * ===================== */
const fetchComments = async (reset = false) => {
  if (!goal.value || isLoadingMore.value) return;
  if (!hasMore.value && !reset) return;

  isLoadingMore.value = true;

  if (reset) {
    page.value = 1;
    hasMore.value = true;
    comments.value.data = [];
  }

  const res = await apiComments.retrieveAll({
    filter: { goal_id: goal.value._id },
    sort: '-created_at',
    page: page.value,
    page_size: 50,
  });

  comments.value.data.push(...res.data);
  hasMore.value = res.pagination?.page < res.pagination?.page_count ? true : false;
  page.value++;

  isLoadingMore.value = false;
};

/* =====================
 * Scroll handler
 * ===================== */
const onScroll = async () => {
  if (!scrollRef.value || isLoadingMore.value || !hasMore.value) return;

  const el = scrollRef.value;
  const threshold = 80;

  if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
    await fetchComments();
  }
};

/* =====================
 * Modal open
 * ===================== */
watch(isOpen, async (val) => {
  if (val) {
    await fetchComments(true);
  }
});

function closeModal() {
  isOpen.value = false;
}

/* =====================
 * Mention search
 * ===================== */
const onSearchMention = async (payload: { trigger: Trigger; query: string }) => {
  isMentionLoading.value = true;

  const res = await useApiUsers().retrieveAll({
    username: payload.query,
  });

  userOptions.value = res.data.map((u: IUser) => ({
    _id: u._id!,
    label: u.username!,
    link: `/@${u.username}`,
  }));

  isMentionLoading.value = false;
};

const onTypingComment = (e: KeyboardEvent) => {
  if (e.key.length !== 1) return;
  isMentionLoading.value = true;
};

/* =====================
 * Comment submit
 * ===================== */
const inputComment = ref('');
const isCommenting = ref(false);

const onComment = async () => {
  if (isCommenting.value || !goal.value) return;
  isCommenting.value = true;

  try {
    await apiComments.create({
      goal_id: goal.value._id,
      created_by_id: myUser.value?._id,
      comment: inputComment.value,
      mentions: mentions.value,
    });

    const newComment: IComment = {
      goal_id: goal.value._id,
      comment: inputComment.value,
      mentions: mentions.value,
      created_by: myUser.value as IUser,
      created_at: new Date(),
    };

    comments.value.data.unshift(newComment);
    goal.value.total_comments++;

    inputComment.value = '';
    mentions.value = [];
  } finally {
    isCommenting.value = false;
  }
};

const onEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) return;
  e.preventDefault();
  onComment();
};
</script>

<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex z-[999]
             items-end lg:items-center justify-center"
      @click.self="closeModal"
    >
      <div
        class="bg-white w-full max-w-lg rounded-t-2xl lg:rounded-2xl
               p-4 max-h-[80vh] flex flex-col"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-semibold text-lg">Comments</h2>
          <button class="text-gray-500" @click="closeModal">
            <i class="i-lucide-x" />
          </button>
        </div>

        <!-- Comment List -->
        <div
          ref="scrollRef"
          class="flex flex-1 flex-col gap-3 py-4 overflow-y-auto"
          @scroll="onScroll"
        >
          <div
            v-for="(comment, index) in tokenizedComments"
            :key="index"
            class="flex items-start gap-2"
          >
            <avatar :size="32" :user="comments.data[index]?.created_by" />

            <p class="flex flex-col">
              <span class="space-x-1 text-sm">
                <span class="font-semibold">
                  {{ comments.data[index]?.created_by?.username }}
                </span>

                <span class="whitespace-pre-wrap">
                  <template v-for="(t, i) in comment" :key="i">
                    <router-link
                      v-if="t.type === 'mention' && t.link"
                      :to="t.link"
                      class="text-blue-600"
                      @click="closeModal"
                    >
                      {{ t.text }}
                    </router-link>
                    <span v-else>{{ t.text }}</span>
                  </template>
                </span>
              </span>

              <span class="text-xs text-slate-400">
                <client-only>
                  {{ timeAgo(comments.data[index]?.created_at) }}
                </client-only>
              </span>
            </p>
          </div>

          <div v-if="isLoadingMore" class="text-center text-xs text-gray-400 py-2">
            Loading more…
          </div>

          <div
            v-else-if="!hasMore && comments.data.length"
            class="text-center text-xs text-gray-400 py-2"
          >
            No more comments
          </div>
        </div>

        <!-- Input -->
        <form
          v-if="myUser"
          class="flex gap-2 mt-4"
          @submit.prevent="onComment"
        >
          <base-mention
            v-model="inputComment"
            class="flex-1"
            placeholder="Add a comment..."
            :options="{ '@': userOptions }"
            :loading="isMentionLoading"
            autofocus
            @update:mentions="mentions = $event"
            @search="onSearchMention"
            @keydown="onTypingComment"
            @keydown.enter="onEnter"
          />

          <base-button type="submit" variant="text" color="primary">
            <span class="text-xs">POST</span>
          </base-button>
        </form>
      </div>
    </div>
  </transition>
</template>

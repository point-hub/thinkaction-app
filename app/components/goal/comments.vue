<script setup lang="ts">
import type { IGoal } from '~/composables/api/goals';
import { ref } from 'vue';
import { useApiComments, type IComment } from '~/composables/api/comments';
import { useApiUsers } from '~/composables/api/users';

const goal = defineModel<IGoal>('goal');
const isOpen = defineModel<boolean>('isOpen', { default: false });
const apiComments = useApiComments();

const { user: myUser } = useAuth();

const comments = ref({ data: [] as IComment[], pagination: {} });

type Trigger = '@' | '#'

interface MentionOption {
  _id: string
  label: string
  link?: string
}

const userOptions = ref<MentionOption[]>([]);

const tokenizedComments = computed(() =>
  comments.value.data.map((_, index) =>
    useMentionTokens(comments.value.data[index]?.comment ?? '', comments.value.data[index]?.mentions),
  ),
);

const isMentionLoading = ref(false);
const mentions = ref([]);
const onSearchMention = async (payload: { trigger: Trigger; query: string }) => {
  isMentionLoading.value = true;

  const response = await useApiUsers().retrieveAll({ username: payload.query });
  userOptions.value = response.data.map((u: IUser) => ({
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

const isShowSuggestions = ref();
const showSuggestions = (val: boolean) => {
  isShowSuggestions.value = val;
};

function closeModal() {
  isOpen.value = false;
}

const inputComment = ref('');
const isCommenting = ref(false);
const onComment = async () => {
  if (isCommenting.value) return;
  isCommenting.value = true;

  if (!goal.value) return;

  try {
    await useApiComments().create({
      goal_id: goal.value?._id,
      created_by_id: myUser.value?._id,
      comment: inputComment.value,
      mentions: mentions.value,
    });

    goal.value.comments.pop();
    goal.value.comments.unshift({
      goal_id: goal.value._id,
      comment: inputComment.value,
      mentions: mentions.value,
      created_by: myUser.value as IUser,
    });
    comments.value.data.unshift({
      goal_id: goal.value._id,
      comment: inputComment.value,
      mentions: mentions.value,
      created_by: myUser.value as IUser,
      created_at: new Date(),
    });

    goal.value.total_comments++;
    inputComment.value = '';
  } catch (error) {
    isCommenting.value = false;
  } finally {
    isCommenting.value = false;
  }
};

const onEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) return;
  e.preventDefault();
  onComment();
};

watch(isOpen, async (val) => {
  if (val === true) {
    comments.value  = await apiComments.retrieveAll({
      filter: { goal_id: goal.value?._id },
      sort: '-created_at',
      limit: 20,
    });
  }
});
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
        class="bg-white w-full max-w-lg rounded-t-2xl lg:rounded-2xl lg:min-h-[40vh] p-4 max-h-[80vh] animate-slide-up flex flex-col"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-semibold text-lg">Comments</h2>
          <button class="text-gray-500" @click="closeModal"><i class="i-lucide-x" /></button>
        </div>

        <!-- Comment List -->
        <div class="flex flex-1 flex-col gap-3 py-4 overflow-y-auto">
          <div
            v-for="(comment, index) in tokenizedComments"
            :key="index"
            class="flex items-start gap-2"
          >
            <avatar :size="32" :user="comments.data[index]?.created_by" />
            <p class="flex flex-col">
              <span class="space-x-1 text-sm">
                <span class="font-semibold">{{ comments.data[index]?.created_by?.username }}</span>
                <span class="whitespace-pre-wrap">
                  <template v-for="(t, i) in comment" :key="i">
                    <router-link v-if="t.type === 'mention' && t.link" :to="t.link" style="color: #007bff;" @click="closeModal">
                      {{ t.text }}
                    </router-link>
                    <span v-else>
                      {{ t.text }}
                    </span>
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
        </div>

        <!-- Input -->
        <form v-if="myUser" class="flex justify-between gap-2 mt-4" @submit.prevent="onComment">
          <base-mention
            v-model="inputComment"
            class="flex-1"
            placeholder="Add a comment..."
            :options="{ '@': userOptions }"
            :loading="isMentionLoading"
            autofocus
            @show-suggestions="showSuggestions"
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

<script setup lang="ts">
import { useApiUsers } from '~/composables/api/users';

const { user, updateUser } = useAuth();

const form = ref({
  username: user.value?.username,
  name: user.value?.name,
  profile: {
    status: user.value?.profile?.status,
    bio: user.value?.profile?.bio,
  },
});

interface FormErrors {
  username: string[]
  name: string[]
  profile: {
    status: string[]
    bio: string[]
  }
}

const defaultFormErrors = {
  username: [],
  name: [],
  profile: {
    status: [],
    bio: [],
  },
};

const formErrors = ref<FormErrors>(defaultFormErrors);

const resetFormErrors = () => {
  formErrors.value = defaultFormErrors;
};

const isSubmitting = ref(false);
const onSave = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    if (!user.value?._id) throw new Error('User ID is missing');

    await useApiUsers().update(user.value._id, form.value);

    resetFormErrors();

    updateUser({
      ...user.value,
      name: form.value.name,
      profile: form.value.profile,
    });
    toast('Update profile success.', { color: 'success', timer: 10000 });
  } catch (error: unknown) {
    const errors = handleError(error);
    if (errors) {
      formErrors.value.name = errors.name || [];
      formErrors.value.profile.status = errors['profile.status'] || [];
      formErrors.value.profile.bio = errors['profile.bio'] || [];
    }
  } finally {
    isSubmitting.value = false;
  }
};

const MAX_PROFILE_BIO_CHARS = 150;
const profileBioCharsCount = computed(() => {
  return form.value.profile.bio?.length ?? 0;
});

watch(
  () => form.value.profile.bio,
  (newValue) => {
    if (newValue && newValue.length > MAX_PROFILE_BIO_CHARS) {
      form.value.profile.bio = newValue.substring(0, MAX_PROFILE_BIO_CHARS);
    }
  },
);
</script>

<template>
  <layouts-with-sidebar title="Edit Profile" sidebar-title="Settings">
    <template #sidebar>
      <settings-sidebar />
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="onSave">
      <div class="flex flex-col gap-2">
        <p class="font-bold">Username</p>
        <base-input v-model="form.name" :disabled="true" autofocus :errors="formErrors.name" type="text" placeholder="Name" size="lg" rounded />
      </div>
      <div class="flex flex-col gap-2">
        <p class="font-bold">Name</p>
        <base-input v-model="form.name" :disabled="isSubmitting" autofocus :errors="formErrors.name" type="text" placeholder="Name" size="lg" rounded />
      </div>
      <div class="flex flex-col gap-2">
        <p class="font-bold">Status</p>
        <base-input v-model="form.profile.status" :disabled="isSubmitting" :errors="formErrors.profile.status" type="text" placeholder="Status" size="lg" rounded />
      </div>
      <div class="flex flex-col gap-2">
        <p class="font-bold">Bio</p>
        <div class="relative">
          <base-textarea
            v-model="form.profile.bio"
            :min-height="150"
            :disabled="isSubmitting"
            :errors="formErrors.profile.bio"
            type="text"
            placeholder="Enter your bio..."
            size="lg"
            rounded
          />

          <div class="flex justify-end mt-1 px-1">
            <span
              :class="{ 'text-red-600': profileBioCharsCount > 500 }"
              class="text-xs text-slate-500"
            >
              {{ profileBioCharsCount }} / {{ MAX_PROFILE_BIO_CHARS }} characters
            </span>
          </div>
        </div>
      </div>

      <div class="mt-10">
        <base-button type="submit" :is-loading="isSubmitting" size="xl" class="w-full" variant="filled" color="primary">
          Save
        </base-button>
      </div>
    </form>
  </layouts-with-sidebar>
</template>

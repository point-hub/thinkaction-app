<script setup lang="ts">
import { useApiUsers } from '~/composables/api/users';

const { user } = useAuth();

const form = ref({
  private_account: user.value?.private_account,
});

interface FormErrors {
  private_account: string[]
}

const formErrors = ref<FormErrors>({
  private_account: [],
});

const isSubmitting = ref(false);
const onSwitch = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    if (!user.value?._id) throw new Error('User ID is missing');

    await useApiUsers().update(user.value._id, form.value);

    toast('Update privacy success.', { color: 'success', timer: 10000 });
  } catch (error: unknown) {
    const errors = handleError(error);
    if (errors) {
      formErrors.value.private_account = errors.private_account || [];
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <layouts-with-sidebar title="Account Privacy" sidebar-title="Settings">
    <template #sidebar>
      <settings-sidebar />
    </template>

    <div class="flex justify-between items-center gap-2 border border-slate-300 rounded-xl p-4">
      <div>Private Account</div>
      <div class="mt-2">
        <base-switch v-model="form.private_account" :disabled="isSubmitting" :errors="formErrors.private_account" size="lg" @change="onSwitch" />
      </div>

    </div>

    <div class="p-4 text-slate-500 flex flex-col gap-4 text-sm">
      <p>
        When your account is public, your profile and posts can be seen by anyone.
      </p>
      <p>
        When your account is private, only the supporters you approve can see what you share.
        Certain info on your profile, like your profile picture and username, is visible to everyone
      </p>
    </div>
  </layouts-with-sidebar>
</template>

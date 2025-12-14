<script setup lang="ts">
import { useApiUsers } from '~/composables/api/users';

const { user } = useAuth();

const form = ref();
const formReset = () => {
  form.value = {
    current_password: '',
    password: '',
  };
};
formReset();

interface FormErrors {
  current_password: string[]
  password: string[]
}

const formErrors = ref<FormErrors>({
  current_password: [],
  password: [],
});

const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const isSubmitting = ref(false);
const onSave = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    if (!user.value?._id) throw new Error('User ID is missing');

    await useApiUsers().updatePassword(user.value._id, form.value);

    formReset();

    toast('Update password success.', { color: 'success', timer: 10000 });
  } catch (error: unknown) {
    const errors = handleError(error);
    if (errors) {
      formErrors.value.current_password = errors.current_password || [];
      formErrors.value.password = errors.password || [];
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <layouts-with-sidebar title="Edit Password" sidebar-title="Settings">
    <template #sidebar>
      <settings-sidebar />
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="onSave">
      <div class="flex flex-col gap-2">
        <p class="text-slate-600 mb-4">Your password must be at least 8 characters</p>
        <p class="font-bold">Current Password</p>
        <base-input id="password" v-model="form.current_password" :disabled="isSubmitting" :errors="formErrors.current_password" :type="showPassword ? 'text' : 'password'" placeholder="Password" size="lg" rounded>
          <template #suffix>
            <button type="button" class="text-xl focus:outline-none" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="togglePassword">
              <span :class="showPassword ? 'i-mdi:eye-off-outline' : 'i-mdi:eye-outline'" />
            </button>
          </template>
        </base-input>
      </div>

      <div class="flex flex-col gap-2">
        <p class="font-bold">New Password</p>
        <base-input id="password" v-model="form.password" :disabled="isSubmitting" :errors="formErrors.password" :type="showPassword ? 'text' : 'password'" placeholder="Password" size="lg" rounded>
          <template #suffix>
            <button type="button" class="text-xl focus:outline-none" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="togglePassword">
              <span :class="showPassword ? 'i-mdi:eye-off-outline' : 'i-mdi:eye-outline'" />
            </button>
          </template>
        </base-input>
      </div>

      <div class="mt-10">
        <base-button type="submit" :is-loading="isSubmitting" size="xl" class="w-full" variant="filled" color="primary">
          Save
        </base-button>
      </div>
    </form>
  </layouts-with-sidebar>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://thinkaction.id/reset-password' },
  ],
});

useSeoMeta({
  title: 'Reset Password | Thinkaction',
  description: 'Set a new secure password for your Thinkaction account.',
  ogTitle: 'Reset Password | Thinkaction',
  ogType: 'website',
  ogSiteName: 'Thinkaction',
  ogDescription: 'Set a new secure password for your Thinkaction account.',
});

const route = useRoute();

const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const form = ref({
  code: route.query.code,
  password: '',
});

const formErrors = ref<Record<string, string[]>>({
  code: [],
  password: [],
});

const isSaving = ref(false);
const signin = async () => {
  if (isSaving.value) return;
  isSaving.value = true;

  try {
    await useAuth().resetPassword(form.value.code as string, form.value.password);
    toast('Your password has been reset successfully! You can now log in with your new password.', { color: 'success', timer: 10000 });
    navigateTo('/signin');
  } catch (error: unknown) {
    const errors = handleError(error);
    if (errors) {
      formErrors.value.username = errors.username || [];
      formErrors.value.password = errors.password || [];
    }
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="relative w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 z-10 overflow-hidden">
    <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply opacity-70 animate-float-one" />
    <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply opacity-70 animate-float-two" />

    <div class="text-center mb-8">
      <div class="flex justify-center">
        <logo />
      </div>
      <p class="text-gray-600 text-lg font-logo">
        Where every post brings you closer to your Goals!
      </p>
    </div>

    <form class="flex flex-col gap-2" @submit.prevent="signin">

      <p class="text-sm text-slate-500">Copy the reset code from your email and paste it below</p>
      <base-input id="code" v-model="form.code" :errors="formErrors.code" type="text" placeholder="Reset Code" size="lg" rounded>
        <template #suffix>
          <span class="i-material-symbols:encrypted-rounded text-xl text-blue bg-blue" />
        </template>
      </base-input>

      <base-input id="password" v-model="form.password" autofocus :errors="formErrors.password" :type="showPassword ? 'text' : 'password'" placeholder="New Password" size="lg" rounded>
        <template #suffix>
          <button type="button" class="text-xl text-blue focus:outline-none" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="togglePassword">
            <span :class="showPassword ? 'i-mdi:eye-off-outline' : 'i-mdi:eye-outline'" />
          </button>
        </template>
      </base-input>

      <button type="submit" class="w-full cursor-pointer mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold py-3 rounded-xl text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105">
        Reset Password
      </button>
    </form>

    <div class="mt-8 text-center text-gray-700">
      Remember your password?
      <nuxt-link to="/signin" class="text-blue-500 hover:text-blue-700 font-bold transition-colors">
        Sign In!
      </nuxt-link>
    </div>
  </div>
</template>

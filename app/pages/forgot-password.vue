<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://thinkaction.id/forgot-password' },
  ],
});

useSeoMeta({
  title: 'Forgot Password | Thinkaction',
  description: 'Reset your Thinkaction account password securely to regain access to your goals and ideas.',
  ogTitle: 'Forgot Password | Thinkaction',
  ogType: 'website',
  ogSiteName: 'Thinkaction',
  ogDescription: 'Reset your Thinkaction account password securely to regain access to your goals and ideas.',
});

const form = ref({
  email: '',
});

const formErrors = ref<Record<string, string[]>>({
  email: [],
});

const isSubmitting = ref(false);
const onSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    await useAuth().requestPassword(form.value.email);
    toast(`We've sent a password reset to ${form.value.email}. Follow the instructions in the email to reset your password.`, { color: 'success', timer: 10000 });
    navigateTo('/reset-password');
  } catch (error: unknown) {
    const errors = handleError(error);
    if (errors) {
      formErrors.value.email = errors.email || [];
    }
  } finally {
    isSubmitting.value = false;
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

    <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
      <base-input id="email" v-model="form.email" autofocus :errors="formErrors.email" type="text" placeholder="Email" size="lg" rounded>
        <template #suffix>
          <span class="i-mdi:mail-outline text-xl text-blue bg-blue" />
        </template>
      </base-input>

      <button type="submit" class="w-full cursor-pointer mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold py-3 rounded-xl text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105">
        Request Password
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

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://thinkaction.id/verify-email' },
  ],
});

useSeoMeta({
  title: 'Verify Email | Thinkaction',
  description: 'Enter your verification code to confirm your email and activate your Thinkaction account.',
  ogTitle: 'Verify Email | Thinkaction',
  ogType: 'website',
  ogSiteName: 'Thinkaction',
  ogDescription: 'Enter your verification code to confirm your email and activate your Thinkaction account.',
});

const route = useRoute();

const form = ref({
  code: route.query.code?.toString() ?? '',
});

const formErrors = ref<Record<string, string[]>>({
  code: [],
});

const isSaving = ref(false);
const verify = async () => {
  if (isSaving.value) return;
  isSaving.value = true;

  try {
    await useAuth().verifyEmail(form.value.code);
    toast('Email verified successfully! You can now sign in to your account.', {
      color: 'success',
    });
    navigateTo('/signin');
  } catch (error) {
    const errors = handleError(error);
    if (errors) {
      formErrors.value.code = errors.code || [];
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

    <form class="flex flex-col gap-2" @submit.prevent="verify">
      <p class="text-slate-500 text-sm">Check your email and paste verification code here</p>
      <base-input v-model="form.code" autofocus :errors="formErrors.code" :disabled="isSaving" type="text" placeholder="Verification Code" size="lg" rounded />

      <base-button type="submit" :is-loading="isSaving" size="xl" class="w-full cursor-pointer mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold py-3 rounded-xl text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105">
        Verify
      </base-button>
    </form>

    <div class="mt-8 text-center text-gray-700">
      Already have verified account?
      <nuxt-link to="/signin" class="text-blue-500 hover:text-blue-700 font-bold transition-colors">
        Sign In!
      </nuxt-link>
    </div>
  </div>
</template>
